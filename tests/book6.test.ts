import { describe, expect, it } from 'vitest';
import { DAG_G, DIR_G, dfsFrames, kosarajuFrames, longestFrames, outAdj, tarjanFrames } from '../src/lib/dfs';

const rand = (n: number, p: number, dag = false) => {
  const edges: [number, number][] = [];
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && (!dag || u < v) && Math.random() < p) edges.push([u, v]);
  return { names: [...Array(n)].map((_, i) => String(i)), xy: [] as [number, number][], edges };
};
const reach = (g: { names: string[]; edges: [number, number, number?][] }) => {
  const n = g.names.length, R = [...Array(n)].map((_, i) => { const s = new Set([i]), st = [i]; const a = outAdj(g as never); while (st.length) for (const w of a[st.pop()!]) if (!s.has(w)) { s.add(w); st.push(w); } return s; });
  return R;
};

describe('dfs clock', () => {
  it('intervals nest, edge classes match the clock rules, cycle iff back edge', () => {
    for (let t = 0; t < 100; t++) {
      const g = rand(1 + Math.floor(Math.random() * 10), 0.2, t % 2 === 0), f = dfsFrames(g).at(-1)!;
      const { pre, post } = f;
      for (const [u, v] of g.edges) {
        const c = f.cls[`${u},${v}`];
        if (c === 'back') expect(pre[v] <= pre[u] && post[u] <= post[v]).toBe(true);
        if (c === 'tree' || c === 'fwd') expect(pre[u] < pre[v] && post[v] < post[u]).toBe(true);
        if (c === 'cross') expect(post[v] < pre[u]).toBe(true);
      }
      const R = reach(g), hasCycle = g.edges.some(([u, v]) => R[v].has(u));
      expect(f.cycle).toBe(hasCycle);
      if (!hasCycle) { const rank = new Map(f.post_order.map((v, i) => [v, i])); for (const [u, v] of g.edges) expect(rank.get(u)!).toBeGreaterThan(rank.get(v)!); }
    }
  });
  it('DIR_G has back, forward and cross edges', () => {
    const cls = Object.values(dfsFrames(DIR_G).at(-1)!.cls);
    for (const c of ['tree', 'fwd', 'back', 'cross']) expect(cls).toContain(c);
  });
});

describe('longest path in a dag', () => {
  it('matches brute force over all paths', () => {
    const f = longestFrames(DAG_G, 0, 7).at(-1)!;
    const a = outAdj(DAG_G), w = new Map(DAG_G.edges.map(([u, v, x]) => [`${u},${v}`, x!]));
    const brute = (v: number): number => (v === 7 ? 0 : Math.max(-Infinity, ...a[v].map((x) => w.get(`${v},${x}`)! + brute(x))));
    expect(f.llp[0]).toBe(brute(0));
    expect(f.llp[0]).toBe(15);
  });
});

describe('strong components', () => {
  it('kosaraju and tarjan agree with mutual reachability', () => {
    for (let t = 0; t < 100; t++) {
      const g = t === 0 ? DIR_G : rand(1 + Math.floor(Math.random() * 12), 0.18);
      const R = reach(g), n = g.names.length;
      const k = kosarajuFrames(g).at(-1)!.root, j = tarjanFrames(g).at(-1)!.root;
      for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) {
        const same = R[u].has(v) && R[v].has(u);
        expect(k[u] === k[v]).toBe(same);
        expect(j[u] === j[v]).toBe(same);
      }
    }
    expect(new Set(kosarajuFrames(DIR_G).at(-1)!.root).size).toBe(3);
  });
});

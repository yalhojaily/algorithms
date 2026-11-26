import { describe, expect, it } from 'vitest';
import { rng, type G } from '../src/lib/bookgraphs';
import { BFS_G, DAG_NEG, NEGCYC_G, NEG_G, POS_G, bellmanFordFrames, bfsFrames, dagFrames, dijkstraFrames, mooreFrames } from '../src/lib/sssp';

// reference: Floyd–Warshall-ish Bellman–Ford with V rounds
const ref = (g: G, s: number) => {
  const n = g.names.length, d = Array(n).fill(Infinity); d[s] = 0;
  for (let i = 0; i < n; i++) for (const [u, v, w] of g.edges) if (d[u] + (w ?? 1) < d[v]) d[v] = d[u] + (w ?? 1);
  return d;
};
const randG = (seed: number, neg: boolean, dag = false): G => {
  const r = rng(seed), n = 2 + Math.floor(r() * 8), edges: [number, number, number][] = [];
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && (!dag || u < v) && r() < 0.3) edges.push([u, v, Math.floor(r() * 10) - (neg ? 3 : 0)]);
  return { names: [...Array(n)].map((_, i) => String(i)), xy: [], edges };
};
const noNegCycle = (g: G) => { const n = g.names.length, d = Array(n).fill(0); for (let i = 0; i < n; i++) for (const [u, v, w] of g.edges) d[v] = Math.min(d[v], d[u] + (w ?? 1)); return !g.edges.some(([u, v, w]) => d[u] + (w ?? 1) < d[v]); };

describe('sssp', () => {
  it('example graphs', () => {
    expect(bfsFrames(BFS_G, 0).at(-1)!.dist.every((x) => x < Infinity)).toBe(true);
    expect(dijkstraFrames(POS_G, 0).at(-1)!.dist).toEqual(ref(POS_G, 0));
    const neg = dijkstraFrames(NEG_G, 0).at(-1)!;
    expect(neg.dist).toEqual(ref(NEG_G, 0));
    expect(Math.max(...neg.extracted!)).toBeGreaterThan(1);
    expect(dagFrames(DAG_NEG, 0).at(-1)!.dist).toEqual(ref(DAG_NEG, 0));
    expect(bellmanFordFrames(NEGCYC_G, 0).at(-1)!.msg).toBe('negcycle');
    expect(mooreFrames(NEGCYC_G, 0).at(-1)!.msg).toBe('negcycle');
  });
  it('random graphs: all algorithms agree with the reference', () => {
    for (let t = 1; t <= 120; t++) {
      const unit = randG(t, false); unit.edges.forEach((e) => (e[2] = 1));
      const pos = randG(1000 + t, false), neg = randG(2000 + t, true), dag = randG(3000 + t, true, true);
      expect(bfsFrames(unit, 0).at(-1)!.dist).toEqual(ref(unit, 0));
      expect(dijkstraFrames(pos, 0).at(-1)!.dist).toEqual(ref(pos, 0));
      expect(dagFrames(dag, 0).at(-1)!.dist).toEqual(ref(dag, 0));
      const bf = bellmanFordFrames(neg, 0).at(-1)!, mo = mooreFrames(neg, 0).at(-1)!;
      if (noNegCycle(neg)) {
        expect(bf.msg).toBe('done'); expect(bf.dist).toEqual(ref(neg, 0));
        expect(mo.dist).toEqual(ref(neg, 0));
        expect(dijkstraFrames(neg, 0).at(-1)!.dist).toEqual(ref(neg, 0));
      }
    }
  });
});

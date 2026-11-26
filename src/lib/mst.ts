// Book chapter 7: minimum spanning trees, frame by frame.
import { componentsOf, type G } from './bookgraphs';

export const ekey = (u: number, v: number) => (u < v ? `${u},${v}` : `${v},${u}`);
const W = (g: G, k: number) => g.edges[k][2] ?? 1;

/** Every spanning tree (as edge-index lists) of a small connected graph. */
export function spanningTrees(g: G): number[][] {
  const n = g.names.length, m = g.edges.length, out: number[][] = [];
  const pick: number[] = [];
  const rec = (i: number) => {
    if (pick.length === n - 1) {
      const c = componentsOf(n, pick.map((k) => g.edges[k]));
      if (Math.max(...c) === 1) out.push([...pick]);
      return;
    }
    if (i === m || m - i < n - 1 - pick.length) return;
    pick.push(i); rec(i + 1); pick.pop(); rec(i + 1);
  };
  rec(0);
  return out;
}

/** Erickson's ShorterEdge, as a comparator on edge indices. */
export function shorterEdge(g: G) {
  return (a: number, b: number) => {
    const [i, j] = g.edges[a], [k, l] = g.edges[b];
    return W(g, a) - W(g, b) || Math.min(i, j) - Math.min(k, l) || Math.max(i, j) - Math.max(k, l);
  };
}

export interface MFrame {
  F: number[];                // edge indices in the forest
  useless: number[];          // edge indices known useless
  safe: number[];             // safe edges being added now (Borůvka) / the edge examined
  comp: number[];             // component label per vertex (1..)
  cur: number;                // edge index examined, −1 none
  phase: string;
  pq?: { k: number; w: number }[];
  round?: number;
}

const usefulState = (g: G, F: number[]) => {
  const comp = componentsOf(g.names.length, F.map((k) => g.edges[k]));
  const fs = new Set(F);
  const useless = g.edges.map((e, k) => k).filter((k) => !fs.has(k) && comp[g.edges[k][0]] === comp[g.edges[k][1]]);
  return { comp, useless };
};

export function boruvkaFrames(g: G): MFrame[] {
  const F: number[] = [], out: MFrame[] = [];
  let round = 0;
  for (;;) {
    const { comp, useless } = usefulState(g, F);
    const count = Math.max(...comp);
    if (count === 1) { out.push({ F: [...F], useless, safe: [], comp, cur: -1, phase: 'done', round }); break; }
    round++;
    const safe: number[] = Array(count + 1).fill(-1);
    g.edges.forEach(([u, v], k) => {
      const a = comp[u], b = comp[v];
      if (a === b) return;
      if (safe[a] < 0 || W(g, k) < W(g, safe[a])) safe[a] = k;
      if (safe[b] < 0 || W(g, k) < W(g, safe[b])) safe[b] = k;
    });
    const S = [...new Set(safe.slice(1))];
    out.push({ F: [...F], useless, safe: S, comp, cur: -1, phase: 'safe', round });
    for (const k of S) F.push(k);
    const st = usefulState(g, F);
    out.push({ F: [...F], useless: st.useless, safe: S, comp: st.comp, cur: -1, phase: 'added', round });
  }
  return out;
}

export function kruskalFrames(g: G): MFrame[] {
  const order = g.edges.map((_, k) => k).sort((a, b) => W(g, a) - W(g, b));
  const n = g.names.length, parent = [...Array(n).keys()];
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const F: number[] = [], out: MFrame[] = [];
  out.push({ F: [], useless: [], safe: [], comp: componentsOf(n, []), cur: -1, phase: 'start' });
  for (const k of order) {
    const [u, v] = g.edges[k];
    const ok = find(u) !== find(v);
    const st = usefulState(g, F);
    out.push({ F: [...F], useless: st.useless, safe: ok ? [k] : [], comp: st.comp, cur: k, phase: ok ? 'safe' : 'useless' });
    if (ok) { parent[find(u)] = find(v); F.push(k); }
    if (F.length === n - 1) break;
  }
  const st = usefulState(g, F);
  out.push({ F: [...F], useless: st.useless, safe: [], comp: st.comp, cur: -1, phase: 'done' });
  return out;
}

/** Jarník with a priority queue of edges (best-first search). */
export function jarnikFrames(g: G, s = 0): MFrame[] {
  const n = g.names.length, adj: number[][] = g.names.map(() => []);
  g.edges.forEach(([u, v], k) => { adj[u].push(k); adj[v].push(k); });
  const inT = Array(n).fill(false), F: number[] = [], out: MFrame[] = [];
  const pq: { k: number; w: number }[] = [];
  const snap = (phase: string, cur = -1, safe: number[] = []) => {
    const st = usefulState(g, F);
    out.push({ F: [...F], useless: st.useless, safe, comp: st.comp, cur, phase, pq: [...pq].sort((a, b) => a.w - b.w) });
  };
  const addV = (v: number) => { inT[v] = true; for (const k of adj[v]) { const [a, b] = g.edges[k]; if (!inT[a] || !inT[b]) pq.push({ k, w: W(g, k) }); } };
  addV(s); snap('start');
  while (pq.length && F.length < n - 1) {
    pq.sort((a, b) => a.w - b.w);
    const { k } = pq.shift()!;
    const [u, v] = g.edges[k];
    if (inT[u] && inT[v]) { snap('useless', k); continue; }
    snap('safe', k, [k]);
    F.push(k); addV(inT[u] ? v : u);
    snap('added', k);
  }
  snap('done');
  return out;
}

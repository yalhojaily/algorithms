// Book chapter 10: maximum flows and minimum cuts.
import type { G } from './bookgraphs';

/** A reduced flow network: edges [u, v, capacity], no antiparallel pairs; s = 0, t = n − 1. */
export type Net = G;
const mk = (names: string, xy: [number, number][], E: string, c: number[]): Net => {
  const N = names.split(''), id = (x: string) => N.indexOf(x);
  return { names: N, xy, edges: E.split(' ').map((e, k) => [id(e[0]), id(e[1]), c[k]] as [number, number, number]) };
};

/** The classic six-vertex network (CLRS-style), made reduced. */
export const FLOW_NET = mk('sabcdt',
  [[0, 1], [1.5, 0], [1.5, 2], [3, 0], [3, 2], [4.5, 1]],
  'sa sb ba ac cb bd dc ct dt', [16, 13, 4, 12, 9, 14, 7, 20, 4]);

/** Edmonds and Karp's bad example (Figure 10.7) with X = big. */
export const badNet = (X: number): Net => mk('suvt', [[0, 1], [1.5, 0], [1.5, 2], [3, 1]], 'su sv uv ut vt', [X, X, 1, X, X]);

export const cap = (net: Net, k: number) => net.edges[k][2] ?? 0;
export const value = (net: Net, f: number[]) =>
  net.edges.reduce((a, [u, v], k) => a + (u === 0 ? f[k] : 0) - (v === 0 ? f[k] : 0), 0);
/** Net flow out of each vertex: ∂f(v) = in − out in the book's sign; we return out − in. */
export const excess = (net: Net, f: number[]) => {
  const d = net.names.map(() => 0);
  net.edges.forEach(([u, v], k) => { d[u] += f[k]; d[v] -= f[k]; });
  return d;
};
export const cutCapacity = (net: Net, S: Set<number>) =>
  net.edges.reduce((a, [u, v], k) => a + (S.has(u) && !S.has(v) ? cap(net, k) : 0), 0);

/** Residual arcs: forward (dir 1) with c − f, backward (dir −1) with f. */
export interface Arc { u: number; v: number; k: number; dir: 1 | -1; r: number }
export function residualArcs(net: Net, f: number[]): Arc[] {
  const out: Arc[] = [];
  net.edges.forEach(([u, v], k) => {
    if (cap(net, k) - f[k] > 0) out.push({ u, v, k, dir: 1, r: cap(net, k) - f[k] });
    if (f[k] > 0) out.push({ u: v, v: u, k, dir: -1, r: f[k] });
  });
  return out;
}

export type Rule = 'dfs' | 'bfs' | 'fat';
/** An augmenting path in G_f by the given rule, or null. */
export function augmentingPath(net: Net, f: number[], rule: Rule): Arc[] | null {
  const n = net.names.length, s = 0, t = n - 1, A = residualArcs(net, f);
  const out: Arc[][] = net.names.map(() => []);
  for (const a of A) out[a.u].push(a);
  const via: (Arc | null)[] = Array(n).fill(null), seen = Array(n).fill(false);
  if (rule === 'fat') {
    const width = Array(n).fill(-Infinity); width[s] = Infinity;
    for (;;) {
      let u = -1;
      for (let x = 0; x < n; x++) if (!seen[x] && width[x] > -Infinity && (u < 0 || width[x] > width[u])) u = x;
      if (u < 0) break;
      seen[u] = true;
      for (const a of out[u]) { const w = Math.min(width[u], a.r); if (!seen[a.v] && w > width[a.v]) { width[a.v] = w; via[a.v] = a; } }
    }
  } else if (rule === 'bfs') {
    const q = [s]; seen[s] = true;
    for (let h = 0; h < q.length; h++) for (const a of out[q[h]]) if (!seen[a.v]) { seen[a.v] = true; via[a.v] = a; q.push(a.v); }
  } else {
    const dfs = (u: number) => { seen[u] = true; for (const a of out[u]) if (!seen[a.v]) { via[a.v] = a; dfs(a.v); } };
    dfs(s);
  }
  if (!seen[t] || (rule === 'fat' && via[t] === null)) return null;
  const path: Arc[] = [];
  for (let x = t; x !== s; x = via[x]!.u) path.push(via[x]!);
  return path.reverse();
}

export interface FFrame { f: number[]; path: Arc[] | null; F: number; value: number; iter: number; S: number[] | null }
/** Ford–Fulkerson with a path rule; the last frame carries the minimum cut S. */
export function fordFulkersonFrames(net: Net, rule: Rule, maxIter = 500): FFrame[] {
  const f = net.edges.map(() => 0), out: FFrame[] = [];
  let iter = 0;
  for (; iter < maxIter; iter++) {
    const path = augmentingPath(net, f, rule);
    if (!path) break;
    const F = Math.min(...path.map((a) => a.r));
    out.push({ f: [...f], path, F, value: value(net, f), iter, S: null });
    for (const a of path) f[a.k] += a.dir * F;
  }
  out.push({ f: [...f], path: null, F: 0, value: value(net, f), iter, S: minCutSide(net, f) });
  return out;
}

/** Vertices reachable from s in G_f. */
export function minCutSide(net: Net, f: number[]): number[] {
  const A = residualArcs(net, f), seen = new Set([0]), st = [0];
  while (st.length) { const u = st.pop()!; for (const a of A) if (a.u === u && !seen.has(a.v)) { seen.add(a.v); st.push(a.v); } }
  return [...seen].sort((a, b) => a - b);
}

/** Bad-example run: alternate s→u→v→t and s→v→u→t, one unit each (Figure 10.7). */
export function badAlternatingIterations(X: number) { return 2 * X; }

export interface DFrame { f: number[]; piece: { edges: number[]; amount: number; kind: 'path' | 'cycle' } | null; done: { edges: number[]; amount: number; kind: 'path' | 'cycle' }[] }
/** Decompose a non-negative flow into paths and cycles (the book's O(VE) walk). */
export function decomposeFrames(net: Net, f0: number[]): DFrame[] {
  const f = [...f0], n = net.names.length, s = 0, t = n - 1, out: DFrame[] = [], done: DFrame['done'] = [];
  out.push({ f: [...f], piece: null, done: [] });
  for (let guard = 0; guard < 100; guard++) {
    const pos = (u: number) => net.edges.findIndex(([a], k) => a === u && f[k] > 0);
    let start = pos(s) >= 0 ? s : -1;
    if (start < 0) for (let v = 0; v < n && start < 0; v++) if (pos(v) >= 0) start = v;
    if (start < 0) break;
    // walk until t or a repeated vertex
    const verts = [start], edges: number[] = [];
    let kind: 'path' | 'cycle' = 'path';
    for (;;) {
      const x = verts[verts.length - 1];
      if (x === t && start === s) break;
      const k = pos(x);
      edges.push(k);
      const y = net.edges[k][1], j = verts.indexOf(y);
      if (j >= 0) { verts.splice(0, j); edges.splice(0, j); kind = 'cycle'; verts.push(y); break; }
      verts.push(y);
    }
    const amount = Math.min(...edges.map((k) => f[k]));
    const piece = { edges, amount, kind };
    out.push({ f: [...f], piece, done: [...done] });
    for (const k of edges) f[k] -= amount;
    done.push(piece);
  }
  out.push({ f: [...f], piece: null, done: [...done] });
  return out;
}

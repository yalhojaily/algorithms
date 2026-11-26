// Book chapter 9: all-pairs shortest paths.
import type { G } from './bookgraphs';

const mk = (names: string, xy: [number, number][], E: string, w: number[]): G => {
  const N = names.split(''), id = (c: string) => N.indexOf(c);
  return { names: N, xy, edges: E.split(' ').map((e, k) => [id(e[0]), id(e[1]), w[k]] as [number, number, number]) };
};

/** Six vertices, one negative edge, no negative cycle. */
export const APSP_G = mk('abcdef',
  [[0, 0], [1.6, 0], [3.2, 0], [0, 1.8], [1.6, 1.8], [3.2, 1.8]],
  'ab bc ad be cf de ed ef fc fb ea', [3, 2, 4, 6, 5, 1, 2, 7, 1, -2, 2]);

/** Figure 9.1 in spirit: adding a constant to every edge changes the shortest path. */
export const REWEIGHT_G = mk('sabct',
  [[0, 1], [1.2, 0], [2.4, 0], [3.6, 0], [4.8, 1]],
  'sa ab bc ct st', [1, 1, 1, 1, 5]);

/** Negative edges for Johnson's prices. */
export const JOHNSON_G = mk('abcde',
  [[0, 1], [1.5, 0], [1.5, 2], [3, 0], [3, 2]],
  'ab ac bc bd cd ce de ea', [-2, 4, 3, 2, -3, 1, 2, 5]);

export type Mat = number[][];
export const weightMatrix = (g: G): Mat => {
  const n = g.names.length, W = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
  for (const [u, v, w] of g.edges) W[u][v] = Math.min(W[u][v], w ?? 1);
  return W;
};
const copy = (M: Mat) => M.map((r) => [...r]);

/** Min-plus product. */
export const minPlus = (A: Mat, B: Mat): Mat =>
  A.map((row, i) => B[0].map((_, j) => Math.min(...row.map((a, k) => a + B[k][j]))));

export interface MatFrame { D: Mat; prev: Mat; label: string; pivot?: number; step: number }

/** ShimbelAPSP: D_ℓ = shortest walks with at most ℓ edges, ℓ = 1 … V − 1 (D_ℓ = D_{ℓ−1} ⊗ W). */
export function shimbelFrames(g: G): MatFrame[] {
  const W = weightMatrix(g), n = W.length, out: MatFrame[] = [];
  let D = copy(W);
  out.push({ D, prev: D, label: 'ℓ = 1', step: 1 });
  for (let l = 2; l < n; l++) { const N = minPlus(D, W); out.push({ D: N, prev: D, label: `ℓ = ${l}`, step: l }); D = N; }
  return out;
}

/** Fischer–Meyer: repeated squaring, D_{2ℓ} = D_ℓ ⊗ D_ℓ. */
export function squaringFrames(g: G): MatFrame[] {
  const W = weightMatrix(g), n = W.length, out: MatFrame[] = [];
  let D = copy(W), i = 0;
  out.push({ D, prev: D, label: 'ℓ = 1', step: 0 });
  while ((1 << i) < n - 1) { i++; const N = minPlus(D, D); out.push({ D: N, prev: D, label: `ℓ = ${1 << i}`, step: i }); D = N; }
  return out;
}

/** Floyd–Warshall: after round r, paths may pass through vertices 0 … r−1. */
export function floydFrames(g: G): MatFrame[] {
  const W = weightMatrix(g), n = W.length, out: MatFrame[] = [];
  let D = copy(W);
  out.push({ D, prev: D, label: 'r = 0', step: 0 });
  for (let r = 0; r < n; r++) {
    const N = copy(D);
    for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (N[u][r] + N[r][v] < N[u][v]) N[u][v] = N[u][r] + N[r][v];
    out.push({ D: N, prev: D, label: `r = ${g.names[r]}`, pivot: r, step: r + 1 });
    D = N;
  }
  return out;
}

/** Floyd–Warshall with pred[u][v] = second-to-last vertex. */
export function floydWithPred(g: G): { D: Mat; P: number[][] } {
  const D = weightMatrix(g), n = D.length;
  const P = D.map((row, u) => row.map((x, v) => (u !== v && x < Infinity ? u : -1)));
  for (let r = 0; r < n; r++) for (let u = 0; u < n; u++) for (let v = 0; v < n; v++)
    if (D[u][r] + D[r][v] < D[u][v]) { D[u][v] = D[u][r] + D[r][v]; P[u][v] = P[r][v]; }
  return { D, P };
}
export const pathFrom = (P: number[][], u: number, v: number): number[] | null => {
  if (u === v) return [u];
  if (P[u][v] < 0) return null;
  const path = [v];
  let x = v;
  for (let k = 0; k <= P.length && x !== u; k++) { x = P[u][x]; path.push(x); }
  return x === u ? path.reverse() : null;
};

/** Johnson's prices: Bellman–Ford from an artificial source with 0-edges to everyone. */
export function johnsonPrices(g: G): number[] | null {
  const n = g.names.length, d = Array(n).fill(0);
  for (let i = 0; i < n; i++) for (const [u, v, w] of g.edges) if (d[u] + (w ?? 1) < d[v]) d[v] = d[u] + (w ?? 1);
  if (g.edges.some(([u, v, w]) => d[u] + (w ?? 1) < d[v])) return null;
  return d;
}

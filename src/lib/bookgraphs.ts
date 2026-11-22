// Book chapter 5: example graphs, whatever-first search frames, flood fill.

export interface G {
  names: string[];
  xy: [number, number][];
  edges: [number, number, number?][];   // undirected; optional weight
}
export const adjOf = (g: G): number[][] => {
  const adj: number[][] = g.names.map(() => []);
  for (const [u, v] of g.edges) { adj[u].push(v); adj[v].push(u); }
  return adj;
};
export const weightOf = (g: G) => {
  const w = new Map<string, number>();
  for (const [u, v, x] of g.edges) { w.set(`${u},${v}`, x ?? 1); w.set(`${v},${u}`, x ?? 1); }
  return (u: number, v: number) => w.get(`${u},${v}`) ?? Infinity;
};

/** The 13-vertex, 19-edge, two-component example graph of Figures 5.4 and 5.9–5.11. */
export const BOOK_G: G = (() => {
  const names = 'abcdefghijklm'.split('');
  const id = (c: string) => names.indexOf(c);
  const E = 'ab ae bc be bf cd cf cg dg ef eg eh fg gi jk jl jm kl lm'.split(' ');
  const xy: [number, number][] = [
    [0, 0], [1.2, 0], [2.4, 0], [3.6, 0], [0.6, 1.1], [1.8, 1.1], [3, 1.1], [0, 2.2], [3.6, 2.2],
    [4.9, 0.3], [6.1, 0.3], [5.5, 1.3], [4.9, 2.2],
  ];
  return { names, xy, edges: E.map((e) => [id(e[0]), id(e[1])] as [number, number]) };
})();

/** An r×c grid (Figure 5.12 uses a grid and starts at the centre). */
export function gridG(r: number, c: number): G {
  const names: string[] = [], xy: [number, number][] = [], edges: [number, number][] = [];
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
    names.push(`${i},${j}`); xy.push([j, i]);
    if (j + 1 < c) edges.push([i * c + j, i * c + j + 1]);
    if (i + 1 < r) edges.push([i * c + j, (i + 1) * c + j]);
  }
  return { names, xy, edges };
}

/** A small weighted graph with distinct weights, for best-first search. */
export const WEIGHTED: G = {
  names: 'sabcdefgh'.split(''),
  xy: [[0, 1], [1, 0], [1, 2], [2, 1], [3, 0], [3, 2], [4, 1], [5, 0], [5, 2]],
  edges: [[0, 1, 4], [0, 2, 8], [1, 2, 11], [1, 3, 2], [2, 3, 7], [1, 4, 9], [3, 4, 6], [3, 5, 1], [2, 5, 12], [4, 6, 3], [5, 6, 5], [4, 7, 10], [6, 7, 13], [6, 8, 14], [5, 8, 15]],
};

export type Bag = 'stack' | 'queue' | 'prim' | 'dijkstra';
export interface WFrame {
  phase: 'start' | 'take' | 'skip' | 'mark' | 'put' | 'newcomp' | 'done';
  bag: { p: number; v: number; key: number }[];
  marked: number[];               // in marking order
  parent: number[];               // −1 = none
  dist: (number | null)[];
  comp: number[];                 // component label, 0 = none
  v: number; p: number;
  count: number;
}

/**
 * WhateverFirstSearch with pairs (parent, vertex) in the bag; with `all` it is WFSAll / CountAndLabel.
 * Neighbours are pushed in adjacency order; for a stack they are pushed in reverse so they pop in order.
 */
export function wfsFrames(g: G, s: number, bag: Bag, all: boolean, max = 4000): WFrame[] {
  const adj = adjOf(g), w = weightOf(g), n = g.names.length;
  const marked: number[] = [], parent = Array(n).fill(-1), comp = Array(n).fill(0);
  const dist: (number | null)[] = Array(n).fill(null);
  let B: { p: number; v: number; key: number }[] = [];
  let count = 0, seq = 0;
  const out: WFrame[] = [];
  const snap = (phase: WFrame['phase'], v = -1, p = -1) => {
    if (out.length < max) out.push({ phase, bag: B.map((x) => ({ ...x })), marked: [...marked], parent: [...parent], dist: [...dist], comp: [...comp], v, p, count });
  };
  const take = () => {
    if (bag === 'stack') return B.pop()!;
    if (bag === 'queue') return B.shift()!;
    let k = 0;
    for (let i = 1; i < B.length; i++) if (B[i].key < B[k].key || (B[i].key === B[k].key && i < k)) k = i;
    return B.splice(k, 1)[0];
  };
  const run = (s0: number) => {
    count++;
    B = [{ p: -1, v: s0, key: 0 }];
    snap(all && count > 1 ? 'newcomp' : 'start', s0);
    while (B.length) {
      const { p, v } = take();
      snap('take', v, p);
      if (marked.includes(v)) { snap('skip', v, p); continue; }
      marked.push(v); parent[v] = p; comp[v] = count;
      dist[v] = p < 0 ? 0 : (dist[p] as number) + w(p, v);
      snap('mark', v, p);
      const nb = bag === 'stack' ? [...adj[v]].reverse() : adj[v];
      for (const x of nb) {
        const key = bag === 'prim' ? w(v, x) : bag === 'dijkstra' ? (dist[v] as number) + w(v, x) : seq++;
        B.push({ p: v, v: x, key });
      }
      snap('put', v, p);
    }
  };
  run(s);
  if (all) for (let v = 0; v < n; v++) if (!marked.includes(v)) run(v);
  snap('done');
  return out;
}

/* ---------------- 5.7 flood fill ---------------- */
export interface FFrame { img: number[][]; cur: [number, number] | null; filled: number; bag: number }
export function floodFrames(img0: number[][], i0: number, j0: number, color: number, bag: 'stack' | 'queue'): FFrame[] {
  const img = img0.map((r) => [...r]), R = img.length, C = img[0].length, old = img[i0][j0];
  const out: FFrame[] = [{ img: img.map((r) => [...r]), cur: null, filled: 0, bag: 1 }];
  if (old === color) return out;
  const B: [number, number][] = [[i0, j0]];
  let filled = 0;
  while (B.length) {
    const [i, j] = bag === 'stack' ? B.pop()! : B.shift()!;
    if (img[i][j] !== old) continue;          // the colour itself is the mark
    img[i][j] = color; filled++;
    for (const [di, dj] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const a = i + di, b = j + dj;
      if (a >= 0 && a < R && b >= 0 && b < C && img[a][b] === old) B.push([a, b]);
    }
    out.push({ img: img.map((r) => [...r]), cur: [i, j], filled, bag: B.length });
  }
  return out;
}

/* ---------- 5.2 definitions ---------- */
/** Component label (1..c) of every vertex. */
export function componentsOf(n: number, edges: [number, number, number?][]): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const c = Array(n).fill(0); let k = 0;
  for (let s = 0; s < n; s++) if (!c[s]) {
    k++; const st = [s];
    while (st.length) { const v = st.pop()!; if (c[v]) continue; c[v] = k; for (const w of adj[v]) if (!c[w]) st.push(w); }
  }
  return c;
}
/** Kind of an undirected simple graph: a forest has exactly V − c edges. */
export function graphKind(n: number, edges: [number, number, number?][]) {
  const c = Math.max(0, ...componentsOf(n, edges));
  const acyclic = edges.length === n - c, connected = c === 1;
  return { c, acyclic, connected, tree: acyclic && connected, forest: acyclic };
}
/** Positions of n vertices on a circle (grid units). */
export const circleXY = (n: number, r = 2): [number, number][] =>
  Array.from({ length: n }, (_, i) => [r + r * Math.sin((2 * Math.PI * i) / n), r - r * Math.cos((2 * Math.PI * i) / n)]);

/** Number of pairs of edges (without a shared endpoint) whose straight segments cross. */
export function crossings(g: G): number {
  const P = g.xy, ccw = (a: number[], b: number[], c: number[]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let k = 0;
  for (let i = 0; i < g.edges.length; i++) for (let j = i + 1; j < g.edges.length; j++) {
    const [a, b] = g.edges[i], [c, d] = g.edges[j];
    if (a === c || a === d || b === c || b === d) continue;
    const d1 = ccw(P[a], P[b], P[c]), d2 = ccw(P[a], P[b], P[d]), d3 = ccw(P[c], P[d], P[a]), d4 = ccw(P[c], P[d], P[b]);
    if (d1 * d2 < 0 && d3 * d4 < 0) k++;
  }
  return k;
}
/** A seeded pseudo-random generator. */
export function rng(seed: number) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); }

/** A blobby r×c picture with k colours (random cells smoothed by a few majority rounds). */
export function blobImage(r: number, c: number, k: number, seed: number): number[][] {
  const R = rng(seed);
  let img = Array.from({ length: r }, () => Array.from({ length: c }, () => Math.floor(R() * k)));
  for (let t = 0; t < 3; t++) {
    img = img.map((row, i) => row.map((x, j) => {
      const cnt = Array(k).fill(0);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const y = img[i + a]?.[j + b]; if (y != null) cnt[y]++; }
      const m = Math.max(...cnt);
      return cnt[x] === m ? x : cnt.indexOf(m);
    }));
  }
  return img;
}

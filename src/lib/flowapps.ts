// Book chapter 11: applications of maximum flows and minimum cuts.
import type { G } from './bookgraphs';

/** A general flow network: edges [u, v, capacity]; capacities may be Infinity; parallel and antiparallel edges allowed. */
export type CapEdge = [number, number, number];
export interface Aug { edges: { k: number; dir: 1 | -1 }[]; verts: number[]; F: number }
export interface MFrame { f: number[]; value: number; aug: Aug | null; S: boolean[] | null }

/** Edmonds–Karp (shortest augmenting paths), recording every iteration; the last frame has the cut side S. */
export function maxflowFrames(n: number, E: CapEdge[], s: number, t: number): MFrame[] {
  const f = E.map(() => 0), frames: MFrame[] = [];
  let value = 0;
  for (let guard = 0; guard < 1000; guard++) {
    const via: ({ k: number; dir: 1 | -1; from: number } | null)[] = Array(n).fill(null), seen = Array(n).fill(false), q = [s];
    seen[s] = true;
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      E.forEach(([a, b, c], k) => {
        if (a === u && !seen[b] && c - f[k] > 0) { seen[b] = true; via[b] = { k, dir: 1, from: u }; q.push(b); }
        if (b === u && !seen[a] && f[k] > 0) { seen[a] = true; via[a] = { k, dir: -1, from: u }; q.push(a); }
      });
    }
    if (!seen[t]) { frames.push({ f: [...f], value, aug: null, S: seen }); break; }
    const edges: Aug['edges'] = [], verts = [t];
    for (let x = t; x !== s; x = via[x]!.from) { edges.push({ k: via[x]!.k, dir: via[x]!.dir }); verts.push(via[x]!.from); }
    edges.reverse(); verts.reverse();
    const F = Math.min(...edges.map(({ k, dir }) => (dir > 0 ? E[k][2] - f[k] : f[k])));
    frames.push({ f: [...f], value, aug: { edges, verts, F }, S: null });
    for (const { k, dir } of edges) f[k] += dir * F;
    value += F;
  }
  return frames;
}
export const maxflow = (n: number, E: CapEdge[], s: number, t: number) => maxflowFrames(n, E, s, t).at(-1)!;

/** Split an integral flow into unit s→t paths (as vertex lists and edge lists); cycles are discarded. */
export function unitPaths(n: number, E: CapEdge[], f0: number[], s: number, t: number): { verts: number[]; edges: number[] }[] {
  const f = [...f0], out: { verts: number[]; edges: number[] }[] = [];
  for (let guard = 0; guard < 500; guard++) {
    const verts = [s], edges: number[] = [];
    while (verts.at(-1) !== t) {
      const x = verts.at(-1)!, k = E.findIndex(([a], j) => a === x && f[j] > 0);
      if (k < 0) return out;
      const y = E[k][1], j = verts.indexOf(y);
      if (j >= 0) { for (const e of edges.slice(j)) f[e]--; f[k]--; verts.length = j + 1; edges.length = j; continue; }
      verts.push(y); edges.push(k);
    }
    for (const e of edges) f[e]--;
    out.push({ verts, edges });
  }
  return out;
}

// ---------- 11.1–11.2: disjoint paths ----------
const mk = (names: string, xy: [number, number][], E: string): G => {
  const N = names.split(''), id = (x: string) => N.indexOf(x);
  return { names: N, xy, edges: E.split(' ').map((e) => [id(e[0]), id(e[1])] as [number, number]) };
};
/** Three edge-disjoint s→t paths, but every s→t path except one passes through x: only two vertex-disjoint paths. */
export const DP_G = mk('sabcxdet',
  [[0, 1.5], [1.2, 0], [1.2, 1.5], [1.2, 3], [2.4, 1.5], [3.6, 0], [3.6, 3], [4.8, 1.5]],
  'sa sb sc ax bx cx ad xd xt xe dt et');

/** Unit-capacity network for edge-disjoint paths. */
export const edgeNet = (g: G): CapEdge[] => g.edges.map(([u, v]) => [u, v, 1]);
/** Ford and Fulkerson's vertex splitting: v → (v_in = 2v, v_out = 2v + 1), edge v_in → v_out of capacity 1 (∞ for s and t). */
export function splitNet(g: G, s: number, t: number): { n: number; E: CapEdge[]; inner: number } {
  const E: CapEdge[] = g.names.map((_, v) => [2 * v, 2 * v + 1, v === s || v === t ? Infinity : 1]);
  const inner = E.length;
  for (const [u, v] of g.edges) E.push([2 * u + 1, 2 * v, 1]);
  return { n: 2 * g.names.length, E, inner };
}
/** Draw the split graph: v_in left of v, v_out right of v. */
export function splitDrawing(g: G, s: number, t: number): G & { tag: string[] } {
  const { E } = splitNet(g, s, t);
  return {
    names: g.names.flatMap((x) => [x, x]),
    tag: g.names.flatMap(() => ['in', 'out']),
    xy: g.xy.flatMap(([x, y]) => [[x - 0.32, y], [x + 0.32, y]] as [number, number][]),
    edges: E.map(([u, v]) => [u, v]),
  };
}

// ---------- 11.3: bipartite matching ----------
export interface Bip { L: string[]; R: string[]; E: [number, number][] }
/** Six doctors, five hospitals; e and f both want only hospital 1, so one of them stays unmatched (maximum 5). */
export const BIP: Bip = { L: ['a', 'b', 'c', 'd', 'e', 'f'], R: ['1', '2', '3', '4', '5'], E: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 0], [5, 0]] };
/** G′: s = 0, L = 1..|L|, R = |L|+1.., t = last. Edge order: s→L, then the bipartite edges, then R→t. */
export function bipNet(b: Bip): { n: number; E: CapEdge[]; m0: number } {
  const nL = b.L.length, nR = b.R.length, t = nL + nR + 1, E: CapEdge[] = [];
  b.L.forEach((_, i) => E.push([0, 1 + i, 1]));
  const m0 = E.length;
  for (const [i, j] of b.E) E.push([1 + i, 1 + nL + j, 1]);
  b.R.forEach((_, j) => E.push([1 + nL + j, t, 1]));
  return { n: t + 1, E, m0 };
}
export interface MatchFrame { M: number[]; path: number[] | null; pathEdges: number[]; S: boolean[] | null; f: number[] }
/** Ford–Fulkerson in G′, read as alternating paths in G. M lists the matched bipartite edge indices. */
export function matchingFrames(b: Bip): MatchFrame[] {
  const { n, E, m0 } = bipNet(b);
  return maxflowFrames(n, E, 0, n - 1).map((fr) => ({
    f: fr.f,
    M: b.E.map((_, k) => k).filter((k) => fr.f[m0 + k] > 0),
    path: fr.aug ? fr.aug.verts.slice(1, -1) : null,
    pathEdges: fr.aug ? fr.aug.edges.filter(({ k }) => k >= m0 && k < m0 + b.E.length).map(({ k }) => k - m0) : [],
    S: fr.S,
  }));
}

// ---------- 11.4: exam scheduling (tuple selection) ----------
export interface Exams { enroll: number[]; seats: number[]; times: number; proctors: number; avail: boolean[][]; maxPer: number }
export const EXAMS: Exams = {
  enroll: [30, 80, 45, 120, 60], seats: [50, 130], times: 3, proctors: 2,
  avail: [[true, true], [true, true], [false, true]], maxPer: 3,
};
/** Vertices: s′, classes, rooms, times, proctors, t′. Returns the network and an index helper. */
export function examNet(x: Exams) {
  const n = x.enroll.length, r = x.seats.length, T = x.times, p = x.proctors;
  const C = (i: number) => 1 + i, Rm = (j: number) => 1 + n + j, Tm = (k: number) => 1 + n + r + k, P = (l: number) => 1 + n + r + T + l;
  const t = 1 + n + r + T + p, E: CapEdge[] = [];
  for (let i = 0; i < n; i++) E.push([0, C(i), 1]);
  for (let i = 0; i < n; i++) for (let j = 0; j < r; j++) if (x.enroll[i] <= x.seats[j]) E.push([C(i), Rm(j), Infinity]);
  for (let j = 0; j < r; j++) for (let k = 0; k < T; k++) E.push([Rm(j), Tm(k), 1]);
  for (let k = 0; k < T; k++) for (let l = 0; l < p; l++) if (x.avail[k][l]) E.push([Tm(k), P(l), 1]);
  for (let l = 0; l < p; l++) E.push([P(l), t, x.maxPer]);
  return { V: t + 1, E, t, C, Rm, Tm, P };
}
/** The schedule read off a flow decomposition: per class [room, time, proctor] or null. */
export function schedule(x: Exams) {
  const net = examNet(x), mf = maxflow(net.V, net.E, 0, net.t);
  const rows: ([number, number, number] | null)[] = x.enroll.map(() => null);
  const n = x.enroll.length, r = x.seats.length, T = x.times;
  for (const { verts } of unitPaths(net.V, net.E, mf.f, 0, net.t)) {
    const [, c, rm, tm, pr] = verts;
    rows[c - 1] = [rm - 1 - n, tm - 1 - n - r, pr - 1 - n - r - T];
  }
  return { rows, value: mf.value, f: mf.f, net };
}

// ---------- 11.5: disjoint-path covers ----------
/** A dag of eight classes; edge i → j: the same professor can teach i and then j. */
export const COVER_DAG = mk('abcdefgh',
  [[0, 0], [0, 1.6], [1.4, 0.8], [2.8, 0], [2.8, 1.6], [4.2, 0.8], [5.6, 0], [5.6, 1.6]],
  'ac bc ad cd ce cf df ef dg fg fh eh');
/** The bipartite graph G′: u♭ on the left, v♯ on the right, an edge u♭v♯ for every u → v. */
export const coverBip = (g: G): Bip => ({ L: g.names, R: g.names, E: g.edges.map(([u, v]) => [u, v]) });
/** Paths of the cover defined by matched edges M (indices into g.edges). */
export function coverPaths(g: G, M: number[]): number[][] {
  const n = g.names.length, next = Array(n).fill(-1), hasIn = Array(n).fill(false);
  for (const k of M) { const [u, v] = g.edges[k]; next[u] = v; hasIn[v] = true; }
  const out: number[][] = [];
  for (let v = 0; v < n; v++) if (!hasIn[v]) { const p = [v]; while (next[p.at(-1)!] >= 0) p.push(next[p.at(-1)!]); out.push(p); }
  return out;
}

// ---------- 11.6: baseball elimination ----------
export interface League { teams: string[]; W: number[]; left: number[]; G: number[][] }
/** American League East, August 30, 1996 (the book's table). */
export const AL_EAST: League = {
  teams: ['NYY', 'BAL', 'BOS', 'TOR', 'DET'],
  W: [75, 71, 69, 63, 49], left: [28, 28, 27, 27, 27],
  G: [[0, 3, 8, 7, 3], [3, 0, 2, 7, 4], [8, 2, 0, 0, 0], [7, 7, 0, 0, 0], [3, 4, 0, 0, 0]],
};
/** The network for team x: s = 0, then game nodes (pairs of other teams with games left), team nodes, t. */
export function baseballNet(L: League, x: number) {
  const others = L.teams.map((_, i) => i).filter((i) => i !== x), best = L.W[x] + L.left[x];
  const pairs: [number, number][] = [];
  for (let a = 0; a < others.length; a++) for (let b = a + 1; b < others.length; b++) if (L.G[others[a]][others[b]] > 0) pairs.push([others[a], others[b]]);
  const gid = (k: number) => 1 + k, tid = (i: number) => 1 + pairs.length + others.indexOf(i), t = 1 + pairs.length + others.length;
  const E: CapEdge[] = [];
  pairs.forEach(([i, j], k) => E.push([0, gid(k), L.G[i][j]]));
  pairs.forEach(([i, j], k) => { E.push([gid(k), tid(i), Infinity]); E.push([gid(k), tid(j), Infinity]); });
  for (const i of others) E.push([tid(i), t, Math.max(0, best - L.W[i])]);
  const trivial = others.filter((i) => L.W[i] > best);
  return { others, pairs, best, E, V: t + 1, t, gid, tid, trivial, games: pairs.reduce((a, [i, j]) => a + L.G[i][j], 0) };
}
export function eliminated(L: League, x: number) {
  const net = baseballNet(L, x), mf = maxflow(net.V, net.E, 0, net.t);
  const R = net.others.filter((i) => mf.S![net.tid(i)]);
  return { ...net, flow: mf.value, f: mf.f, S: mf.S!, out: net.trivial.length > 0 || mf.value < net.games, R };
}

// ---------- 11.7: project selection ----------
export interface Projects { g: G; profit: number[] }
/** Eight projects (the book's profits, our own dependencies); edge u → v: u needs v. */
export const PROJECTS: Projects = {
  g: mk('pqrwabcd', [[0, 0], [1.4, 0], [2.8, 0], [4.2, 0], [0, 1.6], [1.4, 1.6], [2.8, 1.6], [4.2, 1.6]],
    'pa qa qb rb wc wd dc'),
  profit: [4, 6, 2, 3, -2, -3, -5, -8],
};
/** G′: s = n, t = n + 1. */
export function projectNet(P: Projects) {
  const n = P.profit.length, s = n, t = n + 1, E: CapEdge[] = [];
  P.profit.forEach((w, v) => { if (w > 0) E.push([s, v, w]); });
  P.profit.forEach((w, u) => { if (w < 0) E.push([u, t, -w]); });
  for (const [u, v] of P.g.edges) E.push([u, v, Infinity]);
  return { V: n + 2, s, t, E };
}
export function bestProjects(P: Projects) {
  const net = projectNet(P), mf = maxflow(net.V, net.E, net.s, net.t);
  const sel = P.profit.map((_, v) => mf.S![v]);
  const positive = P.profit.reduce((a, w) => a + Math.max(0, w), 0);
  return { ...net, sel, cut: mf.value, positive, profit: positive - mf.value, f: mf.f };
}
/** Missing prerequisites of a chosen set. */
export const missing = (P: Projects, sel: boolean[]) => P.g.edges.filter(([u, v]) => sel[u] && !sel[v]);

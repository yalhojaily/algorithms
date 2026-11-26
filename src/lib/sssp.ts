// Book chapter 8: single-source shortest paths, frame by frame.
import type { G } from './bookgraphs';

export type Edge = [number, number, number?];
const mk = (names: string, xy: [number, number][], E: string, w?: number[]): G => {
  const N = names.split(''), id = (c: string) => N.indexOf(c);
  return { names: N, xy, edges: E.split(' ').map((e, k) => [id(e[0]), id(e[1]), w?.[k] ?? 1] as Edge) };
};

/** Unweighted directed graph for breadth-first search. */
export const BFS_G = mk('sabcdefgh',
  [[0, 1], [1.2, 0], [1.2, 2], [2.4, 0], [2.4, 2], [3.6, 0], [3.6, 2], [4.8, 1], [6, 1]],
  'sa sb ab ac bd cb ce dc df eg fg ge gh dh'.split(' ').slice(0, 13).join(' '));

/** Positive weights. */
export const POS_G = mk('sabcdeft',
  [[0, 1], [1.3, 0], [1.3, 2], [2.6, 0], [2.6, 2], [3.9, 0], [3.9, 2], [5.2, 1]],
  'sa sb ab ac bd cd ce df ef ec et ft', [4, 1, 2, 5, 8, 1, 3, 6, 2, 1, 7, 3]);

/** Negative edges but no negative cycle (Dijkstra re-extracts vertices). */
export const NEG_G = mk('sabcdt',
  [[0, 1], [1.4, 0], [1.4, 2], [2.8, 0], [2.8, 2], [4.2, 1]],
  'sa sb ba ac cd bd dt ct', [1, 5, -5, 2, 1, 4, 2, 6]);

/** A negative cycle a → b → c → a reachable from s. */
export const NEGCYC_G = mk('sabct',
  [[0, 1], [1.4, 0], [2.8, 1], [1.4, 2], [4.2, 1]],
  'sa ab bc ca bt', [2, 1, -4, 2, 3]);

/** A dag with some negative weights. */
export const DAG_NEG = mk('sabcdeft',
  [[0, 1], [1.2, 0], [1.2, 2], [2.4, 1], [3.6, 0], [3.6, 2], [4.8, 1], [6, 1]],
  'sa sb ab ac bc bd cd ce de df ef et ft', [3, 2, -2, 4, 1, 6, -3, 2, 2, 5, -1, 4, 2]);

export const outEdges = (g: G) => {
  const a: number[][] = g.names.map(() => []);
  g.edges.forEach(([u], k) => a[u].push(k));
  return a;
};
const W = (g: G, k: number) => g.edges[k][2] ?? 1;

export interface SFrame {
  dist: number[]; pred: number[];
  cur: number;                    // vertex being scanned
  edge: number;                   // edge index examined
  relaxed: boolean;               // was `edge` just relaxed?
  queue: (number | '|')[];        // '|' is the end-of-phase token
  phase: number;
  relaxCount: number;
  extracted?: number[];           // times each vertex was extracted (Dijkstra)
  msg: 'init' | 'pull' | 'edge' | 'token' | 'round' | 'done' | 'negcycle';
}

const snapF = (out: SFrame[], f: Omit<SFrame, 'dist' | 'pred' | 'queue' | 'extracted'> & { dist: number[]; pred: number[]; queue: (number | '|')[]; extracted?: number[] }) =>
  out.push({ ...f, dist: [...f.dist], pred: [...f.pred], queue: [...f.queue], extracted: f.extracted ? [...f.extracted] : undefined });

/** BFS with the end-of-phase token (unit weights). */
export function bfsFrames(g: G, s: number): SFrame[] {
  const n = g.names.length, out = outEdges(g), dist = Array(n).fill(Infinity), pred = Array(n).fill(-1), F: SFrame[] = [];
  dist[s] = 0;
  const Q: (number | '|')[] = [s, '|'];
  let phase = 1, rc = 0;
  snapF(F, { dist, pred, queue: Q, cur: -1, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'init' });
  while (Q.some((x) => x !== '|')) {
    const u = Q.shift()!;
    if (u === '|') { Q.push('|'); phase++; snapF(F, { dist, pred, queue: Q, cur: -1, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'token' }); continue; }
    snapF(F, { dist, pred, queue: Q, cur: u, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'pull' });
    for (const k of out[u]) {
      const v = g.edges[k][1], ok = dist[v] > dist[u] + 1;
      if (ok) { dist[v] = dist[u] + 1; pred[v] = u; Q.push(v); rc++; }
      snapF(F, { dist, pred, queue: Q, cur: u, edge: k, relaxed: ok, phase, relaxCount: rc, msg: 'edge' });
    }
  }
  snapF(F, { dist, pred, queue: Q, cur: -1, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'done' });
  return F;
}

/** PushDagSSSP: relax outgoing edges in topological order. */
export function dagFrames(g: G, s: number): SFrame[] {
  const n = g.names.length, out = outEdges(g), dist = Array(n).fill(Infinity), pred = Array(n).fill(-1), F: SFrame[] = [];
  // topological order by DFS postorder
  const seen = Array(n).fill(false), po: number[] = [];
  const dfs = (v: number) => { seen[v] = true; for (const k of out[v]) if (!seen[g.edges[k][1]]) dfs(g.edges[k][1]); po.push(v); };
  for (let v = 0; v < n; v++) if (!seen[v]) dfs(v);
  const topo = po.reverse();
  dist[s] = 0;
  let rc = 0;
  snapF(F, { dist, pred, queue: topo, cur: -1, edge: -1, relaxed: false, phase: 0, relaxCount: rc, msg: 'init' });
  topo.forEach((u, i) => {
    snapF(F, { dist, pred, queue: topo.slice(i), cur: u, edge: -1, relaxed: false, phase: i + 1, relaxCount: rc, msg: 'pull' });
    for (const k of out[u]) {
      const v = g.edges[k][1], ok = dist[u] + W(g, k) < dist[v];
      if (ok) { dist[v] = dist[u] + W(g, k); pred[v] = u; rc++; }
      snapF(F, { dist, pred, queue: topo.slice(i), cur: u, edge: k, relaxed: ok, phase: i + 1, relaxCount: rc, msg: 'edge' });
    }
  });
  snapF(F, { dist, pred, queue: [], cur: -1, edge: -1, relaxed: false, phase: n, relaxCount: rc, msg: 'done' });
  return F;
}

/** Erickson's Dijkstra (Figure 8.11): re-inserts vertices, so it is correct with negative edges. */
export function dijkstraFrames(g: G, s: number, maxFrames = 3000): SFrame[] {
  const n = g.names.length, out = outEdges(g), dist = Array(n).fill(Infinity), pred = Array(n).fill(-1), F: SFrame[] = [];
  const ext = Array(n).fill(0);
  dist[s] = 0;
  let pq: number[] = [s], rc = 0;
  const order = () => [...pq].sort((a, b) => dist[a] - dist[b] || a - b);
  snapF(F, { dist, pred, queue: order(), cur: -1, edge: -1, relaxed: false, phase: 0, relaxCount: rc, extracted: ext, msg: 'init' });
  while (pq.length && F.length < maxFrames) {
    const u = order()[0];
    pq = pq.filter((x) => x !== u); ext[u]++;
    snapF(F, { dist, pred, queue: order(), cur: u, edge: -1, relaxed: false, phase: 0, relaxCount: rc, extracted: ext, msg: 'pull' });
    for (const k of out[u]) {
      const v = g.edges[k][1], ok = dist[u] + W(g, k) < dist[v];
      if (ok) { dist[v] = dist[u] + W(g, k); pred[v] = u; rc++; if (!pq.includes(v)) pq.push(v); }
      snapF(F, { dist, pred, queue: order(), cur: u, edge: k, relaxed: ok, phase: 0, relaxCount: rc, extracted: ext, msg: 'edge' });
    }
  }
  snapF(F, { dist, pred, queue: [], cur: -1, edge: -1, relaxed: false, phase: 0, relaxCount: rc, extracted: ext, msg: 'done' });
  return F;
}

/** BellmanFord: V − 1 rounds over all edges, then a check for a tense edge. */
export function bellmanFordFrames(g: G, s: number): SFrame[] {
  const n = g.names.length, dist = Array(n).fill(Infinity), pred = Array(n).fill(-1), F: SFrame[] = [];
  dist[s] = 0;
  let rc = 0;
  snapF(F, { dist, pred, queue: [], cur: -1, edge: -1, relaxed: false, phase: 0, relaxCount: rc, msg: 'init' });
  for (let i = 1; i < n; i++) {
    let any = false;
    g.edges.forEach(([u, v], k) => {
      const ok = dist[u] + W(g, k) < dist[v];
      if (ok) { dist[v] = dist[u] + W(g, k); pred[v] = u; rc++; any = true; }
      snapF(F, { dist, pred, queue: [], cur: u, edge: k, relaxed: ok, phase: i, relaxCount: rc, msg: 'edge' });
    });
    snapF(F, { dist, pred, queue: [], cur: -1, edge: -1, relaxed: false, phase: i, relaxCount: rc, msg: 'round' });
    if (!any) break;
  }
  const tense = g.edges.findIndex(([u, v], k) => dist[u] + W(g, k) < dist[v]);
  snapF(F, { dist, pred, queue: [], cur: -1, edge: tense, relaxed: false, phase: n - 1, relaxCount: rc, msg: tense >= 0 ? 'negcycle' : 'done' });
  return F;
}

/** Moore's queue-based Bellman-Ford with the token; stops after V − 1 phases. */
export function mooreFrames(g: G, s: number): SFrame[] {
  const n = g.names.length, out = outEdges(g), dist = Array(n).fill(Infinity), pred = Array(n).fill(-1), F: SFrame[] = [];
  dist[s] = 0;
  const Q: (number | '|')[] = [s, '|'];
  let phase = 1, rc = 0;
  snapF(F, { dist, pred, queue: Q, cur: -1, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'init' });
  while (Q.some((x) => x !== '|')) {
    const u = Q.shift()!;
    if (u === '|') {
      if (phase === n - 1) { snapF(F, { dist, pred, queue: Q, cur: -1, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'negcycle' }); return F; }
      Q.push('|'); phase++; snapF(F, { dist, pred, queue: Q, cur: -1, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'token' }); continue;
    }
    snapF(F, { dist, pred, queue: Q, cur: u, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'pull' });
    for (const k of out[u]) {
      const v = g.edges[k][1], ok = dist[u] + W(g, k) < dist[v];
      if (ok) { dist[v] = dist[u] + W(g, k); pred[v] = u; rc++; if (!Q.includes(v)) Q.push(v); }
      snapF(F, { dist, pred, queue: Q, cur: u, edge: k, relaxed: ok, phase, relaxCount: rc, msg: 'edge' });
    }
  }
  snapF(F, { dist, pred, queue: Q, cur: -1, edge: -1, relaxed: false, phase, relaxCount: rc, msg: 'done' });
  return F;
}

/** Shortest-path tree from s in an undirected weighted graph (Dijkstra), as edge indices. */
export function undirectedSPT(g: G, s: number): { tree: number[]; dist: number[] } {
  const n = g.names.length, dist = Array(n).fill(Infinity), pe = Array(n).fill(-1), done = Array(n).fill(false);
  dist[s] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!done[v] && (u < 0 || dist[v] < dist[u])) u = v;
    if (u < 0 || dist[u] === Infinity) break;
    done[u] = true;
    g.edges.forEach(([a, b], k) => {
      const v = a === u ? b : b === u ? a : -1;
      if (v >= 0 && dist[u] + W(g, k) < dist[v]) { dist[v] = dist[u] + W(g, k); pe[v] = k; }
    });
  }
  return { tree: pe.filter((k) => k >= 0), dist };
}

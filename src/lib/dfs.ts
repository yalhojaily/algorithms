// Book chapter 6: depth-first search on directed graphs, frame by frame.
import type { G } from './bookgraphs';

/** Directed: edges are u → v, optional weight. */
export type DG = G;
export const outAdj = (g: DG) => {
  const a: number[][] = g.names.map(() => []);
  for (const [u, v] of g.edges) a[u].push(v);
  return a;
};
export const reverseG = (g: DG): DG => ({ ...g, edges: g.edges.map(([u, v, w]) => [v, u, w] as [number, number, number?]) });

const mk = (names: string, xy: [number, number][], E: string, w?: number[]): DG => {
  const N = names.split(''), id = (c: string) => N.indexOf(c);
  return { names: N, xy, edges: E.split(' ').map((e, k) => [id(e[0]), id(e[1]), w?.[k]] as [number, number, number?]) };
};

/** A directed graph with three strong components {a,b,c,d,e}, {f,g}, {h,i,j}. */
export const DIR_G = mk('abcdefghij',
  [[0, 0], [1.4, 0], [0.7, 1.1], [2.8, 0], [2.1, 1.1], [1.4, 2.3], [2.8, 2.3], [1.4, -1.1], [3.6, -1.1], [4.6, 0.3]],
  'ab bc ca bd de eb ae cf fg gf dg ha hi ij jh ig');

/** A dag (Figure 6.6 in spirit) for topological sort. */
export const DAG_G = mk('sabcdeft',
  [[0, 1], [1.2, 0], [1.2, 2], [2.4, 1], [3.6, 0], [3.6, 2], [4.8, 1], [6, 1]],
  'sa sb ac bc ad be cd cf dt ef et ft', [3, 2, 4, 1, 2, 6, 3, 2, 5, 1, 2, 4]);

export type EClass = 'tree' | 'fwd' | 'back' | 'cross';
export type Status = 'new' | 'active' | 'done';
export interface DFrame {
  clock: number;
  pre: number[]; post: number[];   // 0 = not yet
  status: Status[];
  stack: number[];                  // recursion stack
  cls: Record<string, EClass>;      // "u,v" → class
  cur: number; edge: [number, number] | null;
  post_order: number[];
  msg: 'start' | 'edge' | 'finish' | 'done';
  cycle: boolean;
}

/** DFSAll with a clock; roots tried in index order, edges in list order. */
export function dfsFrames(g: DG): DFrame[] {
  const adj = outAdj(g), n = g.names.length;
  const pre = Array(n).fill(0), post = Array(n).fill(0), status: Status[] = Array(n).fill('new');
  const cls: Record<string, EClass> = {}, stack: number[] = [], po: number[] = [];
  let clock = 0, cycle = false;
  const out: DFrame[] = [];
  const snap = (msg: DFrame['msg'], cur = -1, edge: [number, number] | null = null) =>
    out.push({ clock, pre: [...pre], post: [...post], status: [...status], stack: [...stack], cls: { ...cls }, cur, edge, post_order: [...po], msg, cycle });
  const dfs = (v: number) => {
    status[v] = 'active'; pre[v] = ++clock; stack.push(v);
    snap('start', v);
    for (const w of adj[v]) {
      const k = `${v},${w}`;
      if (status[w] === 'new') { cls[k] = 'tree'; snap('edge', v, [v, w]); dfs(w); }
      else {
        cls[k] = status[w] === 'active' ? 'back' : pre[v] < pre[w] ? 'fwd' : 'cross';
        if (cls[k] === 'back') cycle = true;
        snap('edge', v, [v, w]);
      }
    }
    status[v] = 'done'; post[v] = ++clock; stack.pop(); po.push(v);
    snap('finish', v);
  };
  for (let v = 0; v < n; v++) if (status[v] === 'new') dfs(v);
  snap('done');
  return out;
}

/* ---------- 6.4 longest path in a dag ---------- */
export interface LFrame { llp: (number | null)[]; best: (number | null)[]; cur: number; order: number[]; marked: boolean[]; edge: [number, number] | null; phase: 'call' | 'edge' | 'ret' | 'done' }
/** Memoized LongestPath(v, t) from Erickson, as frames. llp = −Infinity for no path. */
export function longestFrames(g: DG, s: number, t: number): LFrame[] {
  const adj = outAdj(g), n = g.names.length, wt = new Map<string, number>();
  for (const [u, v, w] of g.edges) wt.set(`${u},${v}`, w ?? 1);
  const llp: (number | null)[] = Array(n).fill(null), best: (number | null)[] = Array(n).fill(null), marked = Array(n).fill(false), order: number[] = [];
  const out: LFrame[] = [];
  const snap = (phase: LFrame['phase'], cur = -1, edge: [number, number] | null = null) =>
    out.push({ llp: [...llp], best: [...best], cur, order: [...order], marked: [...marked], edge, phase });
  const go = (v: number): number => {
    if (v === t) { if (!marked[v]) { marked[v] = true; llp[v] = 0; order.push(v); snap('ret', v); } return 0; }
    if (marked[v]) return llp[v] as number;
    marked[v] = true; llp[v] = -Infinity; snap('call', v);
    for (const w of adj[v]) {
      const x = wt.get(`${v},${w}`)! + go(w);
      if (x > (llp[v] as number)) { llp[v] = x; best[v] = w; }
      snap('edge', v, [v, w]);
    }
    order.push(v); snap('ret', v);
    return llp[v] as number;
  };
  go(s); snap('done');
  return out;
}

/* ---------- 6.5–6.6 strong components ---------- */
export interface KFrame {
  phase: 1 | 2 | 3;               // 1: DFS of rev(G); 2: label in G; 3: done
  marked: boolean[]; root: number[]; stack: number[]; cur: number; edge: [number, number] | null; count: number;
}
export function kosarajuFrames(g: DG): KFrame[] {
  const n = g.names.length, radj: number[][] = g.names.map(() => []), adj = outAdj(g);
  for (const [u, v] of g.edges) radj[v].push(u);
  const marked = Array(n).fill(false), root = Array(n).fill(-1), S: number[] = [];
  const out: KFrame[] = [];
  let phase: 1 | 2 | 3 = 1, count = 0;
  const snap = (cur = -1, edge: [number, number] | null = null) => out.push({ phase, marked: [...marked], root: [...root], stack: [...S], cur, edge, count });
  const push = (v: number) => {
    marked[v] = true; snap(v);
    for (const u of radj[v]) if (!marked[u]) { snap(v, [u, v]); push(u); }
    S.push(v); snap(v);
  };
  for (let v = 0; v < n; v++) if (!marked[v]) push(v);
  phase = 2;
  const label = (v: number, r: number) => {
    root[v] = r; snap(v);
    for (const w of adj[v]) if (root[w] < 0) { snap(v, [v, w]); label(w, r); }
  };
  while (S.length) { const v = S.pop()!; snap(v); if (root[v] < 0) { count++; label(v, v); } }
  phase = 3; snap();
  return out;
}

export interface TFrame { pre: number[]; low: number[]; root: number[]; S: number[]; rec: number[]; cur: number; edge: [number, number] | null; msg: 'start' | 'tree' | 'ret' | 'other' | 'skip' | 'pop' | 'done'; clock: number }
export function tarjanFrames(g: DG): TFrame[] {
  const n = g.names.length, adj = outAdj(g);
  const pre = Array(n).fill(0), low = Array(n).fill(0), root = Array(n).fill(-1), S: number[] = [], rec: number[] = [];
  let clock = 0;
  const out: TFrame[] = [];
  const snap = (msg: TFrame['msg'], cur = -1, edge: [number, number] | null = null) =>
    out.push({ pre: [...pre], low: [...low], root: [...root], S: [...S], rec: [...rec], cur, edge, msg, clock });
  const dfs = (v: number) => {
    pre[v] = low[v] = ++clock; S.push(v); rec.push(v); snap('start', v);
    for (const w of adj[v]) {
      if (!pre[w]) { snap('tree', v, [v, w]); dfs(w); low[v] = Math.min(low[v], low[w]); snap('ret', v, [v, w]); }
      else if (root[w] < 0) { low[v] = Math.min(low[v], pre[w]); snap('other', v, [v, w]); }
      else snap('skip', v, [v, w]);
    }
    if (low[v] === pre[v]) { let w: number; do { w = S.pop()!; root[w] = v; } while (w !== v); snap('pop', v); }
    rec.pop();
  };
  for (let v = 0; v < n; v++) if (!pre[v]) dfs(v);
  snap('done');
  return out;
}

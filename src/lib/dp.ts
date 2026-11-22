// Book chapter 3: frame generators for the dynamic-programming widgets.

/* ---------------- 3.1 Fibonacci recursion tree, plain or memoized ---------------- */
export interface FNode { id: number; n: number; depth: number; parent: number; kind: 'call' | 'hit' | 'write'; order: number; x: number }
/** The recursion tree of RecFibo(n), or of MemFibo(n) where repeated calls become leaves that read the table. */
export function fibTree(n: number, memo: boolean) {
  const nodes: FNode[] = [];
  const seen = new Set<number>();
  let order = 0, leaf = 0;
  const go = (k: number, depth: number, parent: number): number => {
    const id = nodes.length;
    const node: FNode = { id, n: k, depth, parent, kind: 'call', order: order++, x: 0 };
    nodes.push(node);
    if (memo && k >= 2 && seen.has(k)) { node.kind = 'hit'; node.x = leaf++; return node.x; }
    if (k < 2) { node.x = leaf++; return node.x; }
    const a = go(k - 1, depth + 1, id), b = go(k - 2, depth + 1, id);
    if (memo) { seen.add(k); node.kind = 'write'; }
    node.x = (a + b) / 2;
    return node.x;
  };
  go(n, 0, -1);
  return { nodes, leaves: leaf };
}

/* ---------------- 3.3 FastSplittable ---------------- */
export interface STFrame { i: number; j: number; table: (boolean | null)[]; isWordCalls: number; hit: boolean | null }
export function splitTableFrames(A: string, isWord: (w: string) => boolean): STFrame[] {
  const n = A.length, T: (boolean | null)[] = Array(n + 2).fill(null);
  T[n + 1] = true;
  let calls = 0;
  const out: STFrame[] = [{ i: n + 1, j: -1, table: [...T], isWordCalls: 0, hit: null }];
  for (let i = n; i >= 1; i--) {
    T[i] = false;
    for (let j = i; j <= n; j++) {
      calls++;
      const ok = isWord(A.slice(i - 1, j)) && T[j + 1] === true;
      if (ok) T[i] = true;
      out.push({ i, j, table: [...T], isWordCalls: calls, hit: ok });
    }
  }
  out.push({ i: 0, j: -1, table: [...T], isWordCalls: calls, hit: null });
  return out;
}

/* ---------------- 3.5 change making ---------------- */
export const DREAM = [1, 4, 7, 13, 28, 52, 91, 365];
export function greedyBills(k: number, d = DREAM): number[] {
  const out: number[] = [], ds = [...d].sort((a, b) => b - a);
  for (const x of ds) while (k >= x) { out.push(x); k -= x; }
  return out;
}
/** MinBills[k] and the last bill used, for every 0..K. */
export function minBillsTable(K: number, d = DREAM) {
  const M = Array(K + 1).fill(Infinity), last = Array(K + 1).fill(0);
  M[0] = 0;
  for (let k = 1; k <= K; k++) for (const x of d) if (x <= k && M[k - x] + 1 < M[k]) { M[k] = M[k - x] + 1; last[k] = x; }
  const bills = (k: number) => { const o: number[] = []; while (k > 0) { o.push(last[k]); k -= last[k]; } return o.sort((a, b) => b - a); };
  return { M, bills };
}

/* ---------------- 3.6 FastLIS2 ---------------- */
export interface LTFrame { i: number; j: number; L: (number | null)[]; best: number | null }
export function lisFirstFrames(A: number[]): LTFrame[] {
  const n = A.length, B = [-Infinity, ...A], L: (number | null)[] = Array(n + 1).fill(null);
  const out: LTFrame[] = [];
  for (let i = n; i >= 0; i--) {
    L[i] = 1;
    out.push({ i, j: -1, L: [...L], best: null });
    for (let j = i + 1; j <= n; j++) {
      if (B[j] > B[i] && 1 + (L[j] as number) > (L[i] as number)) L[i] = 1 + (L[j] as number);
      out.push({ i, j, L: [...L], best: null });
    }
  }
  out.push({ i: -1, j: -1, L: [...L], best: (L[0] as number) - 1 });
  return out;
}

/* ---------------- 3.7 edit distance ---------------- */
export function editTable(A: string, B: string) {
  const m = A.length, n = B.length;
  const E = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    E[i][j] = Math.min(E[i][j - 1] + 1, E[i - 1][j] + 1, E[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
  return E;
}
/** One optimal alignment, walking back from (m, n); prefers the diagonal. */
export function editPath(A: string, B: string, E: number[][]) {
  let i = A.length, j = B.length;
  const cells: [number, number][] = [[i, j]], top: string[] = [], bot: string[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && E[i][j] === E[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1)) { top.push(A[i - 1]); bot.push(B[j - 1]); i--; j--; }
    else if (i > 0 && E[i][j] === E[i - 1][j] + 1) { top.push(A[i - 1]); bot.push(' '); i--; }
    else { top.push(' '); bot.push(B[j - 1]); j--; }
    cells.push([i, j]);
  }
  return { cells, top: top.reverse(), bot: bot.reverse() };
}

/* ---------------- 3.8 FastSubsetSum ---------------- */
export function subsetTable(X: number[], T: number) {
  const n = X.length;
  const S = Array.from({ length: n + 2 }, () => Array(T + 1).fill(false));
  S[n + 1][0] = true;
  for (let i = n; i >= 1; i--) {
    S[i][0] = true;
    for (let t = 1; t <= T; t++) S[i][t] = S[i + 1][t] || (t >= X[i - 1] && S[i + 1][t - X[i - 1]]);
  }
  /** Walk the table forward to recover one subset (1-based indices). */
  const recover = () => {
    if (!S[1][T]) return null;
    const out: number[] = [];
    let t = T;
    for (let i = 1; i <= n && t > 0; i++) if (!S[i + 1][t]) { out.push(i); t -= X[i - 1]; }
    return out;
  };
  return { S, recover };
}

/* ---------------- 3.9 OptimalBST table ---------------- */
export type BSTOrder = 'diag' | 'rows' | 'cols';
export interface OBFrame { i: number; k: number; C: (number | null)[][]; R: (number | null)[][] }
/** 1-based OptCost[i][k] for 1 ≤ i ≤ n+1, 0 ≤ k ≤ n; base cases OptCost[i][i−1] = 0. */
export function optBSTFrames(f: number[], order: BSTOrder): OBFrame[] {
  const n = f.length;
  const C: (number | null)[][] = Array.from({ length: n + 2 }, () => Array(n + 1).fill(null));
  const R: (number | null)[][] = Array.from({ length: n + 2 }, () => Array(n + 1).fill(null));
  for (let i = 1; i <= n + 1; i++) C[i][i - 1] = 0;
  const F = (i: number, k: number) => { let s = 0; for (let t = i; t <= k; t++) s += f[t - 1]; return s; };
  const out: OBFrame[] = [{ i: 0, k: 0, C: C.map((r) => [...r]), R: R.map((r) => [...r]) }];
  const compute = (i: number, k: number) => {
    let best = Infinity, root = i;
    for (let r = i; r <= k; r++) { const c = (C[i][r - 1] as number) + (C[r + 1][k] as number); if (c < best) { best = c; root = r; } }
    C[i][k] = best + F(i, k); R[i][k] = root;
    out.push({ i, k, C: C.map((r) => [...r]), R: R.map((r) => [...r]) });
  };
  if (order === 'diag') for (let d = 0; d < n; d++) for (let i = 1; i + d <= n; i++) compute(i, i + d);
  if (order === 'rows') for (let i = n; i >= 1; i--) for (let k = i; k <= n; k++) compute(i, k);
  if (order === 'cols') for (let k = 1; k <= n; k++) for (let i = k; i >= 1; i--) compute(i, k);
  return out;
}

/* ---------------- 3.10 independent sets in trees ---------------- */
export interface TNodeG { id: number; children: number[]; parent: number; depth: number; x: number }
/** A random rooted tree on n nodes (node 0 is the root), with a tidy layout. */
export function randomTree(n: number, seed: number) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const nodes: TNodeG[] = [{ id: 0, children: [], parent: -1, depth: 0, x: 0 }];
  for (let v = 1; v < n; v++) {
    // prefer recent nodes a little, so the tree is neither a star nor a path
    const p = Math.floor(rnd() * v * 0.7 + v * 0.3 * rnd());
    nodes.push({ id: v, children: [], parent: p, depth: nodes[p].depth + 1, x: 0 });
    nodes[p].children.push(v);
  }
  let leaf = 0;
  const lay = (v: number): number => {
    const c = nodes[v].children;
    if (!c.length) return (nodes[v].x = leaf++);
    const xs = c.map(lay);
    return (nodes[v].x = (xs[0] + xs[xs.length - 1]) / 2);
  };
  lay(0);
  return { nodes, width: leaf };
}
export interface MFrame { v: number; yes: (number | null)[]; no: (number | null)[] }
/** TreeMIS2 in post-order; one frame per finished node. */
export function treeMISFrames(nodes: TNodeG[]) {
  const yes: (number | null)[] = nodes.map(() => null), no: (number | null)[] = nodes.map(() => null);
  const out: MFrame[] = [{ v: -1, yes: [...yes], no: [...no] }];
  const go = (v: number): number => {
    let y = 1, z = 0;
    for (const w of nodes[v].children) { z += go(w); y += no[w] as number; }
    yes[v] = y; no[v] = z;
    out.push({ v, yes: [...yes], no: [...no] });
    return Math.max(y, z);
  };
  go(0);
  // one maximum independent set, top-down
  const chosen = new Set<number>();
  const pick = (v: number, parentIn: boolean) => {
    const take = !parentIn && (yes[v] as number) >= (no[v] as number);
    if (take) chosen.add(v);
    for (const w of nodes[v].children) pick(w, take);
  };
  pick(0, false);
  return { frames: out, chosen };
}

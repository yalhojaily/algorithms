// Book 2.8: optimal binary search trees. The widget lets you choose the root; the Recursion Fairy builds the rest.
import type { TNode } from './bst';

const sum = (f: number[], i: number, k: number) => { let s = 0; for (let t = i; t <= k; t++) s += f[t]; return s; };

/** OptCost(i, k) on 0-based inclusive intervals, memoised (the widget needs instant answers). */
export function optTable(f: number[]) {
  const n = f.length, memo = new Map<number, { cost: number; root: number }>();
  const get = (i: number, k: number): { cost: number; root: number } => {
    if (i > k) return { cost: 0, root: -1 };
    const key = i * 64 + k;
    const m = memo.get(key);
    if (m) return m;
    let best = { cost: Infinity, root: -1 };
    for (let r = i; r <= k; r++) {
      const c = get(i, r - 1).cost + get(r + 1, k).cost;
      if (c < best.cost) best = { cost: c, root: r };
    }
    const res = { cost: best.cost + sum(f, i, k), root: best.root };
    memo.set(key, res);
    return res;
  };
  return { get, n };
}

/** Cost of choosing root r for [i..k] with optimal subtrees: the bracket in the book's recurrence. */
export const costWithRoot = (f: number[], t: ReturnType<typeof optTable>, i: number, k: number, r: number) =>
  sum(f, i, k) + t.get(i, r - 1).cost + t.get(r + 1, k).cost;

/** Builds the tree with root r on [i..k] and optimal subtrees; keys are 1-based indices. */
export function buildTree(t: ReturnType<typeof optTable>, i: number, k: number, r?: number): TNode | null {
  if (i > k) return null;
  const root = r ?? t.get(i, k).root;
  const left = buildTree(t, i, root - 1), right = buildTree(t, root + 1, k);
  const h = 1 + Math.max(left?.h ?? 0, right?.h ?? 0);
  return { key: root + 1, left, right, h } as TNode;
}

/** A perfectly balanced tree on [i..k] (middle as root), and the cost of any tree by the definition (*). */
export function balancedTree(i: number, k: number): TNode | null {
  if (i > k) return null;
  const m = Math.floor((i + k) / 2);
  const left = balancedTree(i, m - 1), right = balancedTree(m + 1, k);
  return { key: m + 1, left, right, h: 1 + Math.max(left?.h ?? 0, right?.h ?? 0) } as TNode;
}
export function treeCost(t: TNode | null, f: number[], depth = 1): number {
  if (!t) return 0;
  return f[t.key - 1] * depth + treeCost(t.left, f, depth + 1) + treeCost(t.right, f, depth + 1);
}

/** Calls made by the plain backtracking OptCost (T(n) = 3T(n−1)+…) and the number of BSTs (Catalan). */
export function backtrackCalls(n: number): number {
  const T = [1];
  for (let m = 1; m <= n; m++) { let s = 1; for (let k = 1; k <= m; k++) s += T[k - 1] + T[m - k]; T.push(s); }
  return T[n];
}
export function catalan(n: number): number {
  const N = [1];
  for (let m = 1; m <= n; m++) { let s = 0; for (let r = 1; r <= m; r++) s += N[r - 1] * N[m - r]; N.push(s); }
  return N[n];
}

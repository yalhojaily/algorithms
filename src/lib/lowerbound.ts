// Decision trees and the adversary argument for lesson 2.10 (comparison-sorting lower bound).

/** All permutations of 0..n−1. perm[i] is the rank of item i (0 = smallest). */
export function perms(n: number): number[][] {
  if (n === 0) return [[]];
  const out: number[][] = [];
  for (const p of perms(n - 1)) for (let k = 0; k <= p.length; k++) {
    // insert rank n−1 at item position k
    out.push([...p.slice(0, k), n - 1, ...p.slice(k)]);
  }
  return out;
}

export function factorial(n: number): number { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }
export const log2Fact = (n: number) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log2(i); return s; };
export const lowerBound = (n: number) => Math.max(0, Math.ceil(log2Fact(n) - 1e-9));
/** Worst-case comparisons of top-down merge sort: n⌈lg n⌉ − 2^⌈lg n⌉ + 1. */
export const mergeWorst = (n: number) => { if (n <= 1) return 0; const c = Math.ceil(Math.log2(n)); return n * c - 2 ** c + 1; };
/** Known optimal worst-case comparison counts S(n), n = 0..12 (Ford–Johnson / exhaustive search). */
export const OPTIMAL = [0, 0, 1, 3, 5, 7, 10, 13, 16, 19, 22, 26, 30];

// ---------- decision trees ----------

/** A sorting algorithm that may only look at items through less(i, j). It returns nothing; we only
 *  record which comparisons it asks. */
export type CmpAlg = (n: number, less: (i: number, j: number) => boolean) => void;

export const ALGS: Record<'ins' | 'sel' | 'merge', CmpAlg> = {
  ins(n, less) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = 1; i < n; i++) for (let j = i; j > 0 && less(a[j], a[j - 1]); j--) [a[j], a[j - 1]] = [a[j - 1], a[j]];
  },
  sel(n, less) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) if (less(a[j], a[m])) m = j;
      [a[i], a[m]] = [a[m], a[i]];
    }
  },
  merge(n, less) {
    const rec = (a: number[]): number[] => {
      if (a.length <= 1) return a;
      const h = a.length >> 1, L = rec(a.slice(0, h)), R = rec(a.slice(h)), out: number[] = [];
      let x = 0, y = 0;
      while (x < L.length && y < R.length) out.push(less(R[y], L[x]) ? R[y++] : L[x++]);
      return out.concat(L.slice(x), R.slice(y));
    };
    rec(Array.from({ length: n }, (_, i) => i));
  },
};

export interface DNode {
  /** Internal node: compare items i and j. Leaf: the sorted order (item indices, smallest first). */
  i?: number; j?: number;
  yes?: DNode; no?: DNode;     // yes: item i < item j
  leaf?: number[];
}

/** Build the decision tree of an algorithm on n items by running it on every permutation. */
export function decisionTree(alg: CmpAlg, n: number): DNode {
  const root: DNode = {};
  for (const p of perms(n)) {
    let node = root;
    alg(n, (i, j) => {
      if (node.i === undefined) { node.i = i; node.j = j; }
      const r = p[i] < p[j];
      const key = r ? 'yes' : 'no';
      node[key] ??= {};
      node = node[key]!;
      return r;
    });
    node.leaf = p.map((_, k) => k).sort((a, b) => p[a] - p[b]);
  }
  return root;
}

export function treeStats(t: DNode): { leaves: number; height: number; redundant: number } {
  if (t.leaf) return { leaves: 1, height: 0, redundant: 0 };
  const kids = [t.yes, t.no].filter(Boolean) as DNode[];
  const st = kids.map(treeStats);
  return {
    leaves: st.reduce((a, s) => a + s.leaves, 0),
    height: 1 + Math.max(...st.map((s) => s.height)),
    redundant: st.reduce((a, s) => a + s.redundant, 0) + (kids.length === 1 ? 1 : 0),   // a comparison whose answer was already known
  };
}

// ---------- adversary ----------

/** The adversary answers "is item i < item j?" so that as many orders as possible stay consistent. */
export function adversary(alive: number[][], i: number, j: number): { answer: boolean; alive: number[][] } {
  const yes = alive.filter((p) => p[i] < p[j]);
  const no = alive.filter((p) => p[i] > p[j]);
  return yes.length >= no.length ? { answer: true, alive: yes } : { answer: false, alive: no };
}

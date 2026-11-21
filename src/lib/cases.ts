// Best, worst and average case costs over all permutations, for lesson 1.5.

import { mulberry32 } from './montecarlo';

export interface CaseAlgo {
  key: string;
  label: string;
  /** What is counted. */
  unit: string;
  pseudo: string[];
  cost: (A: number[]) => number;
  best: { tex: string; f: (n: number) => number; input: string };
  worst: { tex: string; f: (n: number) => number; input: string };
  avg: { tex: string; f: (n: number) => number };
}

export const harmonic = (n: number) => { let h = 0; for (let k = 1; k <= n; k++) h += 1 / k; return h; };

export function linearSearchCost(A: number[]) {
  // Search for the value 1 (which is somewhere in the permutation); count comparisons.
  let c = 0;
  for (let i = 0; i < A.length; i++) { c++; if (A[i] === 1) break; }
  return c;
}

export function maxUpdates(A: number[]) {
  let m = A[0], u = 0;
  for (let i = 1; i < A.length; i++) if (A[i] > m) { m = A[i]; u++; }
  return u;
}

export function insertionComparisons(A0: number[]) {
  const A = A0.slice();
  let c = 0;
  for (let i = 1; i < A.length; i++) {
    const key = A[i];
    let j = i - 1;
    while (j >= 0) { c++; if (A[j] > key) { A[j + 1] = A[j]; j--; } else break; }
    A[j + 1] = key;
  }
  return c;
}

export function quicksortComparisons(A0: number[]) {
  // First element as pivot; partitioning m elements costs m − 1 comparisons.
  let c = 0;
  const qs = (A: number[]): number[] => {
    if (A.length <= 1) return A;
    const [p, ...rest] = A;
    c += rest.length;
    return [...qs(rest.filter((x) => x < p)), p, ...qs(rest.filter((x) => x > p))];
  };
  qs(A0);
  return c;
}

export const CASE_ALGOS: CaseAlgo[] = [
  {
    key: 'search', label: 'البحث الخطي', unit: 'مقارنات',
    pseudo: ['LINEAR-SEARCH(A, n, x):', '  for i ← 0 to n − 1:', '    if A[i] = x: return i', '  return NOT-FOUND'],
    cost: linearSearchCost,
    best: { tex: '1', f: () => 1, input: 'x في الموضع الأول' },
    worst: { tex: 'n', f: (n) => n, input: 'x في الموضع الأخير' },
    avg: { tex: '\\tfrac{n+1}{2}', f: (n) => (n + 1) / 2 },
  },
  {
    key: 'max', label: 'تحديثات الأكبر', unit: 'مرات تنفيذ m ← A[i]',
    pseudo: ['MAX(A, n):', '  m ← A[0]', '  for i ← 1 to n − 1:', '    if A[i] > m:', '      m ← A[i]          // counted', '  return m'],
    cost: maxUpdates,
    best: { tex: '0', f: () => 0, input: 'الأكبر في البداية' },
    worst: { tex: 'n - 1', f: (n) => n - 1, input: 'مرتبة تصاعديًا' },
    avg: { tex: 'H_n - 1', f: (n) => harmonic(n) - 1 },
  },
  {
    key: 'ins', label: 'الترتيب بالإدراج', unit: 'مقارنات',
    pseudo: ['INSERTION-SORT(A, n):', '  for i ← 1 to n − 1:', '    key ← A[i];  j ← i − 1', '    while j ≥ 0 and A[j] > key:  // counted', '      A[j+1] ← A[j];  j ← j − 1', '    A[j+1] ← key'],
    cost: insertionComparisons,
    best: { tex: 'n - 1', f: (n) => n - 1, input: 'مرتبة تصاعديًا' },
    worst: { tex: '\\tfrac{n(n-1)}{2}', f: (n) => (n * (n - 1)) / 2, input: 'مرتبة تنازليًا' },
    avg: { tex: '\\tfrac{n(n-1)}{4} + n - H_n', f: (n) => (n * (n - 1)) / 4 + n - harmonic(n) },
  },
  {
    key: 'qs', label: 'الترتيب السريع (المحور الأول)', unit: 'مقارنات',
    pseudo: ['QUICKSORT(A):', '  if |A| ≤ 1: return A', '  p ← A[0]                    // pivot', '  L ← {x < p};  R ← {x > p}   // |A|−1 comparisons', '  return QUICKSORT(L) + [p] + QUICKSORT(R)'],
    cost: quicksortComparisons,
    best: { tex: '\\approx n \\log_2 n', f: (n) => bestQuick(n), input: 'كل محور هو الوسيط' },
    worst: { tex: '\\tfrac{n(n-1)}{2}', f: (n) => (n * (n - 1)) / 2, input: 'مرتبة (تصاعديًا أو تنازليًا)' },
    avg: { tex: '2(n+1)H_n - 4n', f: (n) => 2 * (n + 1) * harmonic(n) - 4 * n },
  },
];

/** Minimum comparisons of first-pivot quicksort on n distinct keys: split as evenly as possible. */
export function bestQuick(n: number): number {
  const memo: number[] = [0, 0];
  for (let m = 2; m <= n; m++) {
    const l = Math.floor((m - 1) / 2), r = m - 1 - l;
    memo[m] = m - 1 + memo[l] + memo[r];
  }
  return memo[n] ?? 0;
}

/** All permutations of 1..n (Heap's algorithm). */
export function permutations(n: number): number[][] {
  const A = Array.from({ length: n }, (_, i) => i + 1), out: number[][] = [A.slice()];
  const c = new Array(n).fill(0);
  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      const k = i % 2 === 0 ? 0 : c[i];
      [A[k], A[i]] = [A[i], A[k]];
      out.push(A.slice());
      c[i]++; i = 0;
    } else { c[i] = 0; i++; }
  }
  return out;
}

export function randomPermutation(n: number, rand: () => number) {
  const A = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [A[i], A[j]] = [A[j], A[i]]; }
  return A;
}

export interface Distribution {
  exact: boolean;
  samples: number;
  /** cost → count */
  hist: Map<number, number>;
  min: number; max: number; mean: number;
  /** One example input for each cost value. */
  example: Map<number, number[]>;
}

export const EXACT_MAX = 8;

export function distribution(a: CaseAlgo, n: number, samples = 4000, seed = 11): Distribution {
  const exact = n <= EXACT_MAX;
  const inputs = exact ? permutations(n) : (() => { const r = mulberry32(seed); return Array.from({ length: samples }, () => randomPermutation(n, r)); })();
  const hist = new Map<number, number>(), example = new Map<number, number[]>();
  let min = Infinity, max = -Infinity, sum = 0;
  for (const A of inputs) {
    const c = a.cost(A);
    hist.set(c, (hist.get(c) ?? 0) + 1);
    if (!example.has(c)) example.set(c, A);
    min = Math.min(min, c); max = Math.max(max, c); sum += c;
  }
  return { exact, samples: inputs.length, hist, min, max, mean: sum / inputs.length, example };
}

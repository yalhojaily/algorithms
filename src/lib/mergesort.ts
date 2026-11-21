// Merge sort, recorded step by step for lesson 1.9.

import { mulberry32 } from './montecarlo';

export interface MsFrame {
  arr: number[];
  /** Current segment [lo, hi] and its midpoint. */
  lo: number; hi: number; mid: number;
  depth: number;
  phase: 'split' | 'merge' | 'merged' | 'base' | 'done';
  /** Merge pointers into arr (i in the left run, j in the right run) and the output buffer. */
  i?: number; j?: number;
  out?: number[];
  /** Which side the last element came from. */
  took?: 'L' | 'R';
  comparisons: number;
  line: number;
  /** Segments already sorted, as "lo-hi" keys. */
  sorted: Set<string>;
}

export const MS_PSEUDO = [
  'MERGE-SORT(A, lo, hi):',
  '  if lo ≥ hi: return        // size ≤ 1',
  '  mid ← ⌊(lo + hi) / 2⌋',
  '  MERGE-SORT(A, lo, mid)',
  '  MERGE-SORT(A, mid + 1, hi)',
  '  MERGE(A, lo, mid, hi)',
  '',
  'MERGE(A, lo, mid, hi):',
  '  i ← lo;  j ← mid + 1;  out ← []',
  '  while i ≤ mid and j ≤ hi:',
  '    if A[i] ≤ A[j]: append A[i]; i ← i + 1',
  '    else:           append A[j]; j ← j + 1',
  '  append the rest of A[i..mid] and A[j..hi]',
  '  copy out into A[lo..hi]',
];

export function* mergeSortFrames(input: number[]): Generator<MsFrame> {
  const A = input.slice();
  let comparisons = 0;
  const sorted = new Set<string>();
  const f = (lo: number, hi: number, depth: number, phase: MsFrame['phase'], line: number, extra: Partial<MsFrame> = {}): MsFrame =>
    ({ arr: A.slice(), lo, hi, mid: Math.floor((lo + hi) / 2), depth, phase, comparisons, line, sorted: new Set(sorted), ...extra });

  function* sort(lo: number, hi: number, depth: number): Generator<MsFrame> {
    if (lo >= hi) { sorted.add(`${lo}-${hi}`); yield f(lo, hi, depth, 'base', 2); return; }
    const mid = Math.floor((lo + hi) / 2);
    yield f(lo, hi, depth, 'split', 3);
    yield* sort(lo, mid, depth + 1);
    yield* sort(mid + 1, hi, depth + 1);
    // merge
    let i = lo, j = mid + 1;
    const out: number[] = [];
    yield f(lo, hi, depth, 'merge', 9, { i, j, out: [] });
    while (i <= mid && j <= hi) {
      comparisons++;
      if (A[i] <= A[j]) { out.push(A[i]); i++; yield f(lo, hi, depth, 'merge', 11, { i, j, out: out.slice(), took: 'L' }); }
      else { out.push(A[j]); j++; yield f(lo, hi, depth, 'merge', 12, { i, j, out: out.slice(), took: 'R' }); }
    }
    if (i <= mid || j <= hi) {
      while (i <= mid) out.push(A[i++]);
      while (j <= hi) out.push(A[j++]);
      yield f(lo, hi, depth, 'merge', 13, { i, j, out: out.slice() });
    }
    for (let k = 0; k < out.length; k++) A[lo + k] = out[k];
    sorted.add(`${lo}-${hi}`);
    yield f(lo, hi, depth, 'merged', 14);
  }

  yield* sort(0, A.length - 1, 0);
  yield f(0, A.length - 1, 0, 'done', 0);
}

/** All segments of the split tree, by depth. */
export function splitTree(n: number): { lo: number; hi: number; depth: number }[] {
  const out: { lo: number; hi: number; depth: number }[] = [];
  const go = (lo: number, hi: number, depth: number) => {
    out.push({ lo, hi, depth });
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    go(lo, mid, depth + 1);
    go(mid + 1, hi, depth + 1);
  };
  if (n > 0) go(0, n - 1, 0);
  return out;
}

export function makeInput(kind: 'random' | 'sorted' | 'reversed' | 'few', n: number, seed = 3): number[] {
  const r = mulberry32(seed);
  if (kind === 'sorted') return Array.from({ length: n }, (_, i) => 3 + i * 6);
  if (kind === 'reversed') return Array.from({ length: n }, (_, i) => 3 + (n - 1 - i) * 6);
  if (kind === 'few') return Array.from({ length: n }, () => 10 + 20 * Math.floor(r() * 3));
  return Array.from({ length: n }, () => 1 + Math.floor(r() * 99));
}

export function insertionComparisonsOf(A0: number[]) {
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

/** Worst-case comparisons of top-down merge sort: n⌈lg n⌉ − 2^⌈lg n⌉ + 1. */
export const mergeWorst = (n: number) => (n <= 1 ? 0 : n * Math.ceil(Math.log2(n)) - 2 ** Math.ceil(Math.log2(n)) + 1);

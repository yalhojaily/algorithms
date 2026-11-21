// Insertion, selection and bubble sort recorded side by side for lesson 2.8.

import { mulberry32 } from './montecarlo';

export interface SFrame {
  arr: number[];
  /** Indices being compared, and the boundary of the finished part. */
  cmp: number[];
  done: number[];        // indices known to be in final position (or the sorted prefix)
  comps: number;
  writes: number;
  finished?: boolean;
}

export type SortKey = 'ins' | 'sel' | 'bub';

export function* insertion(A0: number[]): Generator<SFrame> {
  const A = A0.slice();
  let comps = 0, writes = 0;
  const f = (cmp: number[], i: number, extra: Partial<SFrame> = {}): SFrame => ({ arr: A.slice(), cmp, done: Array.from({ length: i }, (_, k) => k), comps, writes, ...extra });
  yield f([], 1);
  for (let i = 1; i < A.length; i++) {
    const key = A[i];
    let j = i - 1;
    for (;;) {
      if (j < 0) break;
      comps++;
      yield f([j, j + 1], i);
      if (A[j] > key) { A[j + 1] = A[j]; writes++; j--; A[j + 1] = key; }   // shown as a swap for readability
      else break;
    }
    A[j + 1] = key; writes++;
  }
  yield f([], A.length, { finished: true });
}

export function* selection(A0: number[]): Generator<SFrame> {
  const A = A0.slice();
  let comps = 0, writes = 0;
  const f = (cmp: number[], i: number, extra: Partial<SFrame> = {}): SFrame => ({ arr: A.slice(), cmp, done: Array.from({ length: i }, (_, k) => k), comps, writes, ...extra });
  yield f([], 0);
  for (let i = 0; i < A.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < A.length; j++) { comps++; yield f([m, j], i); if (A[j] < A[m]) m = j; }
    if (m !== i) { [A[i], A[m]] = [A[m], A[i]]; writes += 2; }
  }
  yield f([], A.length, { finished: true });
}

export function* bubble(A0: number[]): Generator<SFrame> {
  const A = A0.slice();
  let comps = 0, writes = 0;
  const n = A.length;
  const f = (cmp: number[], sortedFrom: number, extra: Partial<SFrame> = {}): SFrame => ({ arr: A.slice(), cmp, done: Array.from({ length: n - sortedFrom }, (_, k) => sortedFrom + k), comps, writes, ...extra });
  yield f([], n);
  for (let end = n - 1; end > 0; end--) {
    let swapped = false;
    for (let j = 0; j < end; j++) {
      comps++;
      yield f([j, j + 1], end + 1);
      if (A[j] > A[j + 1]) { [A[j], A[j + 1]] = [A[j + 1], A[j]]; writes += 2; swapped = true; }
    }
    if (!swapped) break;   // early exit: already sorted
  }
  yield f([], 0, { finished: true });
}

export const SORTS: { key: SortKey; label: string; run: (A: number[]) => Generator<SFrame> }[] = [
  { key: 'ins', label: 'الإدراج', run: insertion },
  { key: 'sel', label: 'الاختيار', run: selection },
  { key: 'bub', label: 'الفقاعة', run: bubble },
];

export type InputKind = 'random' | 'sorted' | 'reversed' | 'nearly' | 'few';

export function makeArr(kind: InputKind, n: number, seed = 4): number[] {
  const r = mulberry32(seed);
  const base = Array.from({ length: n }, (_, i) => 1 + Math.round((i * 98) / (n - 1)));
  if (kind === 'sorted') return base;
  if (kind === 'reversed') return base.slice().reverse();
  if (kind === 'few') return Array.from({ length: n }, () => [20, 50, 80][Math.floor(r() * 3)]);
  const A = base.slice();
  if (kind === 'nearly') { for (let t = 0; t < 2; t++) { const i = Math.floor(r() * (n - 1)); [A[i], A[i + 1]] = [A[i + 1], A[i]]; } return A; }
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [A[i], A[j]] = [A[j], A[i]]; }
  return A;
}

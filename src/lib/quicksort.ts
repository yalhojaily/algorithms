// Quicksort recorded frame by frame for lesson 2.9: Lomuto partition or three-way (Dijkstra) partition,
// with three pivot rules.

import { mulberry32 } from './montecarlo';

export type PivotRule = 'last' | 'random' | 'median3';
export type Scheme = 'lomuto' | 'three';

export interface QFrame {
  arr: number[];
  lo: number;
  hi: number;
  /** Lomuto: end of the "< pivot" region. Three-way: the scan index. */
  i: number;
  /** Lomuto: the scan index. Three-way: lt. */
  j: number;
  /** Three-way only: gt. */
  gt: number;
  /** Index currently holding the pivot (Lomuto), or −1. */
  p: number;
  pv: number | null;
  fixed: boolean[];
  line: number;
  note: string;
  comps: number;
  depth: number;
  maxDepth: number;
  done?: boolean;
}

export const Q_PSEUDO: Record<Scheme, string[]> = {
  lomuto: [
    'QUICKSORT(A, lo, hi):',
    '  if lo ≥ hi: return',
    '  choose pivot, swap it into A[hi]',
    '  i ← lo',
    '  for j ← lo to hi − 1:',
    '    if A[j] < A[hi]: swap A[i], A[j]; i ← i + 1',
    '  swap A[i], A[hi]      ▷ pivot is final',
    '  QUICKSORT(A, lo, i − 1)',
    '  QUICKSORT(A, i + 1, hi)',
  ],
  three: [
    'QUICKSORT3(A, lo, hi):',
    '  if lo ≥ hi: return',
    '  p ← pivot value; lt ← lo; i ← lo; gt ← hi',
    '  while i ≤ gt:',
    '    if A[i] < p: swap A[lt], A[i]; lt++; i++',
    '    elif A[i] > p: swap A[i], A[gt]; gt−−',
    '    else: i++',
    '  QUICKSORT3(A, lo, lt − 1)',
    '  QUICKSORT3(A, gt + 1, hi)',
  ],
};

const RULE_AR: Record<PivotRule, string> = { last: 'الأخير', random: 'عشوائي', median3: 'وسيط ثلاثة' };

function pickPivot(A: number[], lo: number, hi: number, rule: PivotRule, rnd: () => number): number {
  if (rule === 'last') return hi;
  if (rule === 'random') return lo + Math.floor(rnd() * (hi - lo + 1));
  const m = (lo + hi) >> 1;
  const c = [lo, m, hi].sort((a, b) => A[a] - A[b]);
  return c[1];
}

export function* quickFrames(A0: number[], scheme: Scheme, rule: PivotRule, seed = 7): Generator<QFrame> {
  const A = A0.slice();
  const n = A.length;
  const fixed = Array(n).fill(false);
  const rnd = mulberry32(seed);
  let comps = 0, maxDepth = 0;
  const F = (o: Partial<QFrame> & { lo: number; hi: number; line: number; note: string; depth: number }): QFrame => ({
    arr: A.slice(), i: -1, j: -1, gt: -1, p: -1, pv: null, fixed: fixed.slice(), comps, maxDepth, ...o,
  });

  function* lomuto(lo: number, hi: number, depth: number): Generator<QFrame> {
    maxDepth = Math.max(maxDepth, depth);
    if (lo >= hi) {
      if (lo === hi) fixed[lo] = true;
      yield F({ lo, hi, line: 2, depth, note: lo === hi ? `جزء من عنصر واحد: A[${lo}] في مكانه` : 'جزء خالٍ' });
      return;
    }
    const k = pickPivot(A, lo, hi, rule, rnd);
    [A[k], A[hi]] = [A[hi], A[k]];
    yield F({ lo, hi, p: hi, pv: A[hi], line: 3, depth, note: `المحور (${RULE_AR[rule]}) = ${A[hi]}، نقلناه إلى آخر الجزء [${lo}..${hi}]` });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      comps++;
      const less = A[j] < A[hi];
      yield F({ lo, hi, i, j, p: hi, pv: A[hi], line: 6, depth, note: `A[${j}] = ${A[j]} ${less ? '<' : '≥'} ${A[hi]}${less ? '، فننقله إلى منطقة الأصغر' : ''}` });
      if (less) { [A[i], A[j]] = [A[j], A[i]]; i++; }
    }
    [A[i], A[hi]] = [A[hi], A[i]];
    fixed[i] = true;
    yield F({ lo, hi, i, p: i, pv: A[i], line: 7, depth, note: `المحور ${A[i]} في مكانه النهائي ${i}: ${i - lo} أصغر منه يسارًا، و${hi - i} يمينًا` });
    yield* lomuto(lo, i - 1, depth + 1);
    yield* lomuto(i + 1, hi, depth + 1);
  }

  function* three(lo: number, hi: number, depth: number): Generator<QFrame> {
    maxDepth = Math.max(maxDepth, depth);
    if (lo >= hi) {
      if (lo === hi) fixed[lo] = true;
      yield F({ lo, hi, line: 2, depth, note: lo === hi ? `جزء من عنصر واحد: A[${lo}] في مكانه` : 'جزء خالٍ' });
      return;
    }
    const p = A[pickPivot(A, lo, hi, rule, rnd)];
    let lt = lo, i = lo, gt = hi;
    yield F({ lo, hi, i, j: lt, gt, pv: p, line: 3, depth, note: `المحور (${RULE_AR[rule]}) = ${p}` });
    while (i <= gt) {
      comps++;
      const v = A[i];
      if (v < p) {
        yield F({ lo, hi, i, j: lt, gt, pv: p, line: 5, depth, note: `${v} < ${p}: إلى منطقة الأصغر` });
        [A[lt], A[i]] = [A[i], A[lt]]; lt++; i++;
      } else if (v > p) {
        yield F({ lo, hi, i, j: lt, gt, pv: p, line: 6, depth, note: `${v} > ${p}: إلى منطقة الأكبر في الآخر` });
        [A[i], A[gt]] = [A[gt], A[i]]; gt--;
      } else {
        yield F({ lo, hi, i, j: lt, gt, pv: p, line: 7, depth, note: `${v} = ${p}: يبقى في الوسط` });
        i++;
      }
    }
    for (let t = lt; t <= gt; t++) fixed[t] = true;
    yield F({ lo, hi, i, j: lt, gt, pv: p, line: 8, depth, note: `${gt - lt + 1} عنصرًا يساوي ${p} استقرت معًا في [${lt}..${gt}]` });
    yield* three(lo, lt - 1, depth + 1);
    yield* three(gt + 1, hi, depth + 1);
  }

  yield F({ lo: 0, hi: n - 1, line: 1, depth: 0, note: 'البداية: الجزء كله' });
  yield* (scheme === 'lomuto' ? lomuto(0, n - 1, 0) : three(0, n - 1, 0));
  for (let t = 0; t < n; t++) fixed[t] = true;
  yield F({ lo: 0, hi: n - 1, line: 1, depth: 0, note: `انتهى: ${comps} مقارنة، وأقصى عمق للاستدعاء ${maxDepth}`, done: true });
}

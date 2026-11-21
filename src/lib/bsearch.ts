// Binary search in its common forms, recorded step by step for lesson 2.7.

export type BsMode = 'find' | 'lower' | 'upper' | 'answer';

export interface BsFrame {
  lo: number; hi: number; mid: number | null;
  /** For 'answer' mode the search runs over numbers, not array indices. */
  line: number;
  note: string;
  comps: number;
  result?: number | null;
}

export const BS_PSEUDO: Record<BsMode, string[]> = {
  find: ['FIND(A, x):', '  lo ← 0;  hi ← n − 1', '  while lo ≤ hi:', '    mid ← ⌊(lo + hi) / 2⌋', '    if A[mid] = x: return mid', '    if A[mid] < x: lo ← mid + 1', '    else: hi ← mid − 1', '  return NOT-FOUND'],
  lower: ['LOWER-BOUND(A, x):   // first i with A[i] ≥ x', '  lo ← 0;  hi ← n', '  while lo < hi:', '    mid ← ⌊(lo + hi) / 2⌋', '    if A[mid] < x: lo ← mid + 1', '    else: hi ← mid', '  return lo'],
  upper: ['UPPER-BOUND(A, x):   // first i with A[i] > x', '  lo ← 0;  hi ← n', '  while lo < hi:', '    mid ← ⌊(lo + hi) / 2⌋', '    if A[mid] ≤ x: lo ← mid + 1', '    else: hi ← mid', '  return lo'],
  answer: ['FIRST-TRUE(lo, hi, P):   // P false…false true…true', '  while lo < hi:', '    mid ← ⌊(lo + hi) / 2⌋', '    if P(mid): hi ← mid', '    else: lo ← mid + 1', '  return lo'],
};

export function* bsFrames(mode: BsMode, A: number[], x: number): Generator<BsFrame> {
  let comps = 0;
  if (mode === 'find') {
    let lo = 0, hi = A.length - 1;
    yield { lo, hi, mid: null, line: 2, note: 'الثابت: إن كان x في A فهو في A[lo..hi].', comps };
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      yield { lo, hi, mid, line: 4, note: `mid = ${mid}، وA[mid] = ${A[mid]}.`, comps };
      comps++;
      if (A[mid] === x) { yield { lo, hi, mid, line: 5, note: `وُجد x في الموضع ${mid}.`, comps, result: mid }; return; }
      if (A[mid] < x) { lo = mid + 1; yield { lo, hi, mid, line: 6, note: `${A[mid]} < ${x}: كل ما على يسار mid أصغر أيضًا. نتجاهله.`, comps }; }
      else { hi = mid - 1; yield { lo, hi, mid, line: 7, note: `${A[mid]} > ${x}: كل ما على يمين mid أكبر أيضًا. نتجاهله.`, comps }; }
    }
    yield { lo, hi, mid: null, line: 8, note: 'المدى خالٍ: x غير موجود.', comps, result: null };
    return;
  }
  if (mode === 'lower' || mode === 'upper') {
    let lo = 0, hi = A.length;
    const goRight = (v: number) => (mode === 'lower' ? v < x : v <= x);
    const sym = mode === 'lower' ? '<' : '≤';
    yield { lo, hi, mid: null, line: 2, note: mode === 'lower' ? 'الثابت: كل A[0..lo−1] < x، وكل A[hi..n−1] ≥ x. والجواب بين lo وhi.' : 'الثابت: كل A[0..lo−1] ≤ x، وكل A[hi..n−1] > x.', comps };
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      yield { lo, hi, mid, line: 4, note: `mid = ${mid}، وA[mid] = ${A[mid]}.`, comps };
      comps++;
      if (goRight(A[mid])) { lo = mid + 1; yield { lo, hi, mid, line: 5, note: `A[mid] ${sym} x: الجواب بعد mid.`, comps }; }
      else { hi = mid; yield { lo, hi, mid, line: 6, note: `A[mid] ليس ${sym} x: قد يكون mid نفسه هو الجواب، فنبقيه (hi ← mid، لا mid − 1).`, comps }; }
    }
    yield { lo, hi, mid: null, line: 7, note: `lo = hi = ${lo}: هذا هو الحد. ${lo === A.length ? 'كل العناصر أصغر.' : `A[${lo}] = ${A[lo]}.`}`, comps, result: lo };
    return;
  }
  // answer: smallest r in [0, x] with r·r ≥ x  (ceil sqrt), shown as first true of P(r) = r² ≥ x
  let lo = 0, hi = x;
  yield { lo, hi, mid: null, line: 1, note: `نبحث عن أصغر r بحيث r² ≥ ${x}. P(r) = (r² ≥ ${x}) خاطئ ثم صحيح.`, comps };
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    yield { lo, hi, mid, line: 2, note: `mid = ${mid}، وmid² = ${mid * mid}.`, comps };
    comps++;
    if (mid * mid >= x) { hi = mid; yield { lo, hi, mid, line: 3, note: `${mid * mid} ≥ ${x}: P(mid) صحيح، فالجواب mid أو قبله.`, comps }; }
    else { lo = mid + 1; yield { lo, hi, mid, line: 4, note: `${mid * mid} < ${x}: P(mid) خاطئ، فالجواب بعده.`, comps }; }
  }
  yield { lo, hi, mid: null, line: 5, note: `الجواب ${lo}: ${lo}² = ${lo * lo} ≥ ${x}${lo > 0 ? `، و${lo - 1}² = ${(lo - 1) ** 2} < ${x}` : ''}.`, comps, result: lo };
}

export const SORTED = [2, 3, 3, 5, 8, 8, 8, 11, 13, 13, 17, 19, 21, 21, 21, 21, 25, 30, 34, 34, 40, 41, 47, 52];

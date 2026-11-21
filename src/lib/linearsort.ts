// Counting sort and LSD radix sort recorded frame by frame for lesson 2.11.

export interface CFrame {
  phase: 'count' | 'prefix' | 'place' | 'done';
  A: number[];
  C: number[];
  out: (number | null)[];
  /** Index into A (count / place) or into C (prefix). */
  at: number;
  /** Index of out just written (place). */
  wrote: number;
  line: number;
  note: string;
}

export const COUNT_PSEUDO = [
  'COUNTING-SORT(A, k):        ▷ keys in 0..k−1',
  '  C ← array of k zeros',
  '  for x in A: C[x] ← C[x] + 1',
  '  for v ← 1 to k − 1: C[v] ← C[v] + C[v − 1]',
  '  for i ← n − 1 down to 0:    ▷ right to left: stable',
  '    C[A[i]] ← C[A[i]] − 1',
  '    OUT[C[A[i]]] ← A[i]',
  '  return OUT',
];

export function* countingFrames(A: number[], k: number): Generator<CFrame> {
  const C = Array(k).fill(0);
  const out: (number | null)[] = Array(A.length).fill(null);
  const F = (o: Partial<CFrame> & Pick<CFrame, 'phase' | 'line' | 'note'>): CFrame => ({ A, C: C.slice(), out: out.slice(), at: -1, wrote: -1, ...o });
  yield F({ phase: 'count', line: 2, note: `مصفوفة العدّ C فيها ${k} خانات، خانة لكل قيمة ممكنة` });
  for (let i = 0; i < A.length; i++) {
    C[A[i]]++;
    yield F({ phase: 'count', at: i, line: 3, note: `A[${i}] = ${A[i]}، فـ C[${A[i]}] صار ${C[A[i]]}` });
  }
  for (let v = 1; v < k; v++) {
    C[v] += C[v - 1];
    yield F({ phase: 'prefix', at: v, line: 4, note: `C[${v}] = ${C[v]}: عدد العناصر ≤ ${v}، أي أن آخر ${v} يذهب إلى الخانة ${C[v] - 1}` });
  }
  for (let i = A.length - 1; i >= 0; i--) {
    C[A[i]]--;
    out[C[A[i]]] = A[i];
    yield F({ phase: 'place', at: i, wrote: C[A[i]], line: 7, note: `A[${i}] = ${A[i]} إلى OUT[${C[A[i]]}]` });
  }
  yield F({ phase: 'done', line: 8, note: `انتهى: ${A.length} + ${k} خطوة تقريبًا، بلا أي مقارنة بين العناصر` });
}

export interface RFrame {
  pass: number;          // 0 = units digit
  arr: number[];         // order at the start of this pass
  buckets: number[][];
  at: number;            // index into arr being distributed, or −1 when collecting
  collected: number[] | null;
  note: string;
}

export const digit = (x: number, d: number, base = 10) => Math.floor(x / base ** d) % base;

export function* radixFrames(A0: number[], digits: number, base = 10): Generator<RFrame> {
  let arr = A0.slice();
  const NAMES = ['الآحاد', 'العشرات', 'المئات', 'الآلاف'];
  for (let d = 0; d < digits; d++) {
    const buckets: number[][] = Array.from({ length: base }, () => []);
    yield { pass: d, arr, buckets: buckets.map((b) => b.slice()), at: -1, collected: null, note: `المرور ${d + 1}: نوزّع حسب خانة ${NAMES[d] ?? d}، من اليسار إلى اليمين` };
    for (let i = 0; i < arr.length; i++) {
      buckets[digit(arr[i], d, base)].push(arr[i]);
      yield { pass: d, arr, buckets: buckets.map((b) => b.slice()), at: i, collected: null, note: `${arr[i]}: خانة ${NAMES[d] ?? d} = ${digit(arr[i], d, base)}` };
    }
    const next = buckets.flat();
    yield { pass: d, arr, buckets: buckets.map((b) => b.slice()), at: -1, collected: next, note: `نجمع الدلاء بالترتيب 0 → ${base - 1}. صار الترتيب صحيحًا حسب آخر ${d + 1} ${d === 0 ? 'خانة' : 'خانات'}` };
    arr = next;
  }
  yield { pass: digits, arr, buckets: Array.from({ length: base }, () => []), at: -1, collected: null, note: `انتهى بعد ${digits} مرورات: كل مرور Θ(n + ${base})` };
}

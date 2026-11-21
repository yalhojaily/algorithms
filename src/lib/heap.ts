// A binary max-heap recorded frame by frame for lesson 2.12: insert, extract-max, build-heap, heapsort.

export type HeapOp = 'insert' | 'extract' | 'build' | 'sort';

export interface HFrame {
  arr: number[];
  /** Heap size: arr[n..] is outside the heap (the sorted tail in heapsort). */
  n: number;
  hl: number[];        // nodes being compared
  moved: number[];     // nodes just swapped
  line: number;
  note: string;
  comps: number;
  swaps: number;
  done?: boolean;
}

export const H_PSEUDO: Record<HeapOp, string[]> = {
  insert: [
    'INSERT(H, x):',
    '  H[n] ← x; n ← n + 1; i ← n − 1',
    '  while i > 0 and H[parent(i)] < H[i]:',
    '    swap H[i], H[parent(i)]',
    '    i ← parent(i)          ▷ parent(i) = ⌊(i − 1)/2⌋',
  ],
  extract: [
    'EXTRACT-MAX(H):',
    '  top ← H[0]; H[0] ← H[n − 1]; n ← n − 1',
    '  SIFT-DOWN(H, 0, n)',
    'SIFT-DOWN(H, i, n):',
    '  c ← the larger child of i  ▷ 2i + 1, 2i + 2',
    '  if c < n and H[c] > H[i]: swap H[i], H[c]; SIFT-DOWN(H, c, n)',
  ],
  build: [
    'BUILD-HEAP(A, n):',
    '  for i ← ⌊n/2⌋ − 1 down to 0:   ▷ leaves are heaps already',
    '    SIFT-DOWN(A, i, n)',
    'SIFT-DOWN(H, i, n):',
    '  c ← the larger child of i',
    '  if c < n and H[c] > H[i]: swap H[i], H[c]; SIFT-DOWN(H, c, n)',
  ],
  sort: [
    'HEAPSORT(A, n):',
    '  BUILD-HEAP(A, n)',
    '  for end ← n − 1 down to 1:',
    '    swap A[0], A[end]       ▷ the max goes to its final place',
    '    SIFT-DOWN(A, 0, end)',
    'SIFT-DOWN(H, i, n): larger child c; if H[c] > H[i]: swap, recurse',
  ],
};

export const parent = (i: number) => (i - 1) >> 1;

export function isMaxHeap(a: number[], n = a.length): boolean {
  for (let i = 1; i < n; i++) if (a[parent(i)] < a[i]) return false;
  return true;
}

export function* heapFrames(start: number[], op: HeapOp, x = 0): Generator<HFrame> {
  const A = start.slice();
  let n = op === 'build' || op === 'sort' ? A.length : A.length;
  let comps = 0, swaps = 0;
  const F = (o: Partial<HFrame> & Pick<HFrame, 'line' | 'note'>): HFrame => ({ arr: A.slice(), n, hl: [], moved: [], comps, swaps, ...o });

  // SIFT-DOWN, shared by extract, build and sort. downLine = line number of the "if" inside sift-down.
  function* siftDown(i: number, size: number, downLine: number): Generator<HFrame> {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      if (l >= size) { yield F({ hl: [i], line: downLine, note: `${A[i]} في ورقة: توقف` }); return; }
      let c = l;
      if (r < size) { comps++; if (A[r] > A[l]) c = r; }
      comps++;
      if (A[c] > A[i]) {
        yield F({ hl: [i, c], line: downLine, note: `الابن الأكبر ${A[c]} > ${A[i]}: نبدّل وننزل` });
        [A[i], A[c]] = [A[c], A[i]]; swaps++;
        yield F({ moved: [i, c], line: downLine, note: `نزل ${A[c]} إلى الموضع ${c}` });
        i = c;
      } else {
        yield F({ hl: [i, c], line: downLine, note: `الابن الأكبر ${A[c]} ≤ ${A[i]}: خاصية الكومة تحققت هنا` });
        return;
      }
    }
  }

  if (op === 'insert') {
    A.push(x); n = A.length;
    let i = n - 1;
    yield F({ hl: [i], line: 2, note: `أضفنا ${x} في آخر المصفوفة (أول خانة فارغة في آخر مستوى)` });
    while (i > 0) {
      const p = parent(i);
      comps++;
      if (A[p] < A[i]) {
        yield F({ hl: [i, p], line: 3, note: `الأب ${A[p]} < ${A[i]}: نصعد` });
        [A[i], A[p]] = [A[p], A[i]]; swaps++;
        yield F({ moved: [i, p], line: 4, note: `صعد ${A[p]} إلى الموضع ${p}` });
        i = p;
      } else {
        yield F({ hl: [i, p], line: 3, note: `الأب ${A[p]} ≥ ${A[i]}: توقف` });
        break;
      }
    }
    yield F({ line: 1, note: `انتهى الإدراج: ${comps} مقارنة، وارتفاع الشجرة ${Math.floor(Math.log2(n))}`, done: true });
    return;
  }

  if (op === 'extract') {
    if (n === 0) { yield F({ line: 1, note: 'الكومة فارغة', done: true }); return; }
    const top = A[0];
    yield F({ hl: [0], line: 2, note: `الأكبر في الجذر: ${top}` });
    A[0] = A[n - 1]; A.pop(); n = A.length;
    if (n === 0) { yield F({ line: 2, note: `أخرجنا ${top}، والكومة فارغة الآن`, done: true }); return; }
    yield F({ hl: [0], line: 2, note: `أخرجنا ${top}، ونقلنا آخر عنصر (${A[0]}) إلى الجذر` });
    yield* siftDown(0, n, 6);
    yield F({ line: 1, note: `انتهى: أخرجنا ${top} بـ ${comps} مقارنة`, done: true });
    return;
  }

  // build / sort
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    yield F({ hl: [i], line: op === 'build' ? 3 : 2, note: `البناء: SIFT-DOWN من الموضع ${i}` });
    yield* siftDown(i, n, op === 'build' ? 6 : 6);
  }
  if (op === 'build') {
    yield F({ line: 1, note: `صارت كومة: ${comps} مقارنة، أقل من 2n = ${2 * n}`, done: true });
    return;
  }
  for (let end = n - 1; end >= 1; end--) {
    [A[0], A[end]] = [A[end], A[0]]; swaps++;
    n = end;
    yield F({ moved: [0, end], line: 4, note: `الأكبر ${A[end]} إلى مكانه النهائي ${end}` });
    yield* siftDown(0, end, 6);
  }
  n = 0;
  yield F({ line: 1, note: `انتهى الترتيب: ${comps} مقارنة و${swaps} تبديلًا`, done: true });
}

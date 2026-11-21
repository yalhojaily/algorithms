// Starter and model-solution code for the lab in lesson 2.12.

export const starter = `// Array layout: the root is H[0]; the children of i are 2i + 1 and 2i + 2; the parent is (i − 1) >> 1.

// 1) A binary MIN-heap ordered by cmp (negative: a comes first). push and pop are O(log n).
//    pop() and peek() return undefined on an empty heap.
class MinHeap {
  constructor(cmp = (a, b) => a - b) {
    this.cmp = cmp;
    this.h = [];
  }
  size() { /* your code here */ }
  peek() { /* your code here */ }
  push(x) { /* your code here */ }
  pop() { /* your code here */ }
}

// 2) Turn A into a min-heap IN PLACE, bottom-up, in O(n). Return A.
function heapify(A) {
  // your code here
}

// 3) Heapsort: return a NEW array sorted ascending. Build a MAX-heap in place on a copy,
//    then repeatedly swap the root to the end and sift down. O(n log n), O(1) extra memory.
function heapSort(A) {
  // your code here
}

// 4) The k largest elements of A in DESCENDING order, in O(n log k):
//    keep a min-heap of size at most k.
function kLargest(A, k) {
  // your code here
}

// 5) Merge k sorted arrays into one sorted array in O(N log k), N = total length.
function mergeKSorted(lists) {
  // your code here
}
`;

export const solution = `class MinHeap {
  constructor(cmp = (a, b) => a - b) {
    this.cmp = cmp;
    this.h = [];
  }
  size() { return this.h.length; }
  peek() { return this.h[0]; }
  push(x) {
    const h = this.h;
    h.push(x);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(h[i], h[p]) >= 0) break;
      [h[i], h[p]] = [h[p], h[i]];
      i = p;
    }
  }
  pop() {
    const h = this.h;
    if (h.length === 0) return undefined;
    const top = h[0], last = h.pop();
    if (h.length > 0) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < h.length && this.cmp(h[l], h[m]) < 0) m = l;
        if (r < h.length && this.cmp(h[r], h[m]) < 0) m = r;
        if (m === i) break;
        [h[i], h[m]] = [h[m], h[i]];
        i = m;
      }
    }
    return top;
  }
}

function siftDown(A, i, n, better) {   // better(a, b): a belongs above b
  for (;;) {
    const l = 2 * i + 1, r = l + 1;
    let m = i;
    if (l < n && better(A[l], A[m])) m = l;
    if (r < n && better(A[r], A[m])) m = r;
    if (m === i) return;
    [A[i], A[m]] = [A[m], A[i]];
    i = m;
  }
}

function heapify(A) {
  for (let i = (A.length >> 1) - 1; i >= 0; i--) siftDown(A, i, A.length, (a, b) => a < b);
  return A;
}

function heapSort(A) {
  const B = A.slice();
  const bigger = (a, b) => a > b;
  for (let i = (B.length >> 1) - 1; i >= 0; i--) siftDown(B, i, B.length, bigger);
  for (let end = B.length - 1; end > 0; end--) {
    [B[0], B[end]] = [B[end], B[0]];
    siftDown(B, 0, end, bigger);
  }
  return B;
}

function kLargest(A, k) {
  const H = new MinHeap();
  for (const x of A) {
    if (H.size() < k) H.push(x);
    else if (k > 0 && x > H.peek()) { H.pop(); H.push(x); }
  }
  const out = [];
  while (H.size()) out.push(H.pop());
  return out.reverse();
}

function mergeKSorted(lists) {
  const H = new MinHeap((a, b) => a[0] - b[0]);       // entries: [value, list index, position]
  lists.forEach((L, i) => { if (L.length) H.push([L[0], i, 0]); });
  const out = [];
  while (H.size()) {
    const [v, i, j] = H.pop();
    out.push(v);
    if (j + 1 < lists[i].length) H.push([lists[i][j + 1], i, j + 1]);
  }
  return out;
}
`;

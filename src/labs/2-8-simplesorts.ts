// Starter and model-solution code for the lab in lesson 2.8.

export const starter = `// Every sort returns a NEW array and leaves A unchanged.
// cmp(a, b) is a comparator: negative if a comes first, positive if b comes first, 0 if equal.
// Default: numbers ascending.
const byValue = (a, b) => a - b;

// 1) Insertion sort, STABLE (equal elements keep their original order).
function insertionSort(A, cmp = byValue) {
  // your code here
}

// 2) Selection sort. Return { sorted, swaps } where swaps counts the swaps you made
//    (do not swap an element with itself). At most n − 1 swaps.
function selectionSort(A, cmp = byValue) {
  // your code here
}

// 3) Bubble sort with early exit: stop as soon as a full pass makes no swap.
//    Return { sorted, passes } where passes counts the passes over the array.
function bubbleSort(A, cmp = byValue) {
  // your code here
}

// 4) Binary insertion sort: like insertion sort, but find the insertion point with
//    binary search (upper bound, to keep it stable). Return { sorted, comparisons }
//    counting calls to cmp. Comparisons must be O(n log n), even though moves stay O(n²).
function binaryInsertionSort(A, cmp = byValue) {
  // your code here
}
`;

export const solution = `const byValue = (a, b) => a - b;

function insertionSort(A, cmp = byValue) {
  const B = A.slice();
  for (let i = 1; i < B.length; i++) {
    const key = B[i];
    let j = i - 1;
    while (j >= 0 && cmp(B[j], key) > 0) { B[j + 1] = B[j]; j--; }   // strictly greater: stable
    B[j + 1] = key;
  }
  return B;
}

function selectionSort(A, cmp = byValue) {
  const B = A.slice();
  let swaps = 0;
  for (let i = 0; i < B.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < B.length; j++) if (cmp(B[j], B[m]) < 0) m = j;
    if (m !== i) { [B[i], B[m]] = [B[m], B[i]]; swaps++; }
  }
  return { sorted: B, swaps };
}

function bubbleSort(A, cmp = byValue) {
  const B = A.slice();
  let passes = 0;
  for (let end = B.length - 1; end > 0; end--) {
    passes++;
    let swapped = false;
    for (let j = 0; j < end; j++) {
      if (cmp(B[j], B[j + 1]) > 0) { [B[j], B[j + 1]] = [B[j + 1], B[j]]; swapped = true; }
    }
    if (!swapped) break;
  }
  return { sorted: B, passes };
}

function binaryInsertionSort(A, cmp = byValue) {
  const B = A.slice();
  let comparisons = 0;
  const c = (a, b) => { comparisons++; return cmp(a, b); };
  for (let i = 1; i < B.length; i++) {
    const key = B[i];
    let lo = 0, hi = i;                       // upper bound of key in B[0..i-1]
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (c(B[mid], key) <= 0) lo = mid + 1; else hi = mid;
    }
    for (let j = i; j > lo; j--) B[j] = B[j - 1];   // still O(i) moves
    B[lo] = key;
  }
  return { sorted: B, comparisons };
}
`;

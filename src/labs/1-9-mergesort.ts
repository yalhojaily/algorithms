// Starter and model-solution code for the lab in lesson 1.9.

export const starter = `// 1) Merge two SORTED arrays into one sorted array, in linear time.
//    When two elements are equal, take the one from A first (this keeps the sort stable).
function merge(A, B) {
  // your code here
}

// 2) Merge sort, top-down. Return a NEW sorted array; do not change A. No .sort().
function mergeSort(A) {
  // your code here
}

// 3) Merge sort, bottom-up, with no recursion: merge runs of width 1, then 2, then 4, ...
function mergeSortBottomUp(A) {
  // your code here
}

// 4) Count inversions (pairs i < j with A[i] > A[j]) in O(n log n) time.
//    Idea: while merging, every time you take an element from the RIGHT half,
//    it is smaller than all the elements still waiting in the LEFT half.
function countInversions(A) {
  // your code here
}
`;

export const solution = `function merge(A, B) {
  const out = [];
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] <= B[j]) out.push(A[i++]);   // <= keeps equal elements in their original order
    else out.push(B[j++]);
  }
  while (i < A.length) out.push(A[i++]);
  while (j < B.length) out.push(B[j++]);
  return out;
}

function mergeSort(A) {
  if (A.length <= 1) return A.slice();
  const mid = Math.floor(A.length / 2);
  return merge(mergeSort(A.slice(0, mid)), mergeSort(A.slice(mid)));
}

function mergeSortBottomUp(A) {
  let runs = A.map((x) => [x]);
  if (runs.length === 0) return [];
  while (runs.length > 1) {
    const next = [];
    for (let k = 0; k < runs.length; k += 2)
      next.push(k + 1 < runs.length ? merge(runs[k], runs[k + 1]) : runs[k]);
    runs = next;
  }
  return runs[0];
}

function countInversions(A) {
  // returns [sorted copy, number of inversions]
  const go = (X) => {
    if (X.length <= 1) return [X.slice(), 0];
    const mid = Math.floor(X.length / 2);
    const [L, a] = go(X.slice(0, mid));
    const [R, b] = go(X.slice(mid));
    const out = [];
    let i = 0, j = 0, c = a + b;
    while (i < L.length && j < R.length) {
      if (L[i] <= R[j]) out.push(L[i++]);
      else { out.push(R[j++]); c += L.length - i; }   // R[j] is smaller than L[i..]
    }
    while (i < L.length) out.push(L[i++]);
    while (j < R.length) out.push(R[j++]);
    return [out, c];
  };
  return go(A)[1];
}
`;

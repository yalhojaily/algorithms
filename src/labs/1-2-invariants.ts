// Starter and model-solution code for the lab in lesson 1.2.

export const starter = `// Every loop below comes with its invariant written as a comment.
// Write the loop so that the invariant is true before every test of the loop condition.
// Tip: call check(condition, message) at the top of the loop while you work;
// it throws if your invariant is ever false, which points you straight to the bug.
function check(cond, msg) { if (!cond) throw new Error('invariant broken: ' + msg); }

// 1) Binary search on a sorted array. Return an index i with A[i] === x, or -1.
//    Invariant: if x is in A, then x is in A[lo..hi].
function binarySearch(A, x) {
  let lo = 0, hi = A.length - 1;
  // your code here
}

// 2) Lower bound: the smallest index i with A[i] >= x (A.length if there is none).
//    Invariant: every element of A[0..lo-1] is < x, and every element of A[hi..n-1] is >= x.
//    Start with lo = 0, hi = A.length, and loop while lo < hi.
function lowerBound(A, x) {
  // your code here
}

// 3) Integer square root: the largest r with r*r <= n, for n >= 0.
//    Invariant: lo*lo <= n < hi*hi. Loop while hi - lo > 1.
function isqrt(n) {
  // your code here
}

// 4) Insertion sort. Return a NEW sorted array; do not change A. No .sort().
//    Invariant (outer loop): B[0..i-1] is sorted and holds the original A[0..i-1].
function insertionSort(A) {
  // your code here
}

// 5) Dutch national flag (Dijkstra): A holds only 0, 1, 2. Rearrange A IN PLACE,
//    in ONE pass, so all 0s come first, then 1s, then 2s. Return A.
//    Invariant: A[0..lo-1] are 0, A[lo..mid-1] are 1, A[mid..hi] unknown, A[hi+1..n-1] are 2.
function dutchFlag(A) {
  let lo = 0, mid = 0, hi = A.length - 1;
  // your code here
}
`;

export const solution = `function check(cond, msg) { if (!cond) throw new Error('invariant broken: ' + msg); }

function binarySearch(A, x) {
  let lo = 0, hi = A.length - 1;
  while (lo <= hi) {                      // invariant: x in A  =>  x in A[lo..hi]
    const mid = lo + Math.floor((hi - lo) / 2);
    if (A[mid] === x) return mid;
    if (A[mid] < x) lo = mid + 1;         // A[lo..mid] are all < x
    else hi = mid - 1;                    // A[mid..hi] are all > x
  }
  return -1;                              // lo > hi: the range is empty
}

function lowerBound(A, x) {
  let lo = 0, hi = A.length;
  while (lo < hi) {                       // A[0..lo-1] < x  and  A[hi..n-1] >= x
    const mid = lo + Math.floor((hi - lo) / 2);
    if (A[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;                              // lo === hi: the boundary
}

function isqrt(n) {
  let lo = 0, hi = n + 1;                 // 0*0 <= n < (n+1)*(n+1)
  while (hi - lo > 1) {                   // invariant: lo*lo <= n < hi*hi
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid <= n) lo = mid; else hi = mid;
  }
  return lo;                              // hi = lo + 1, so lo is the answer
}

function insertionSort(A) {
  const B = A.slice();
  for (let i = 1; i < B.length; i++) {    // B[0..i-1] sorted, original elements
    const key = B[i];
    let j = i - 1;
    while (j >= 0 && B[j] > key) { B[j + 1] = B[j]; j--; }
    B[j + 1] = key;
  }
  return B;
}

function dutchFlag(A) {
  let lo = 0, mid = 0, hi = A.length - 1;
  while (mid <= hi) {                     // the unknown part A[mid..hi] shrinks by one each time
    if (A[mid] === 0) { [A[lo], A[mid]] = [A[mid], A[lo]]; lo++; mid++; }
    else if (A[mid] === 1) { mid++; }
    else { [A[mid], A[hi]] = [A[hi], A[mid]]; hi--; }
  }
  return A;
}
`;

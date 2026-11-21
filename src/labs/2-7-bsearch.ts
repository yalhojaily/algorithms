// Starter and model-solution code for the lab in lesson 2.7.

export const starter = `// All arrays are sorted in non-decreasing order. Every function must be O(log n)
// (except where the comment says otherwise). Use the half-open style: lo ← 0, hi ← n, while lo < hi.

// 1) The first index i with A[i] >= x (A.length if none).
function lowerBound(A, x) {
  // your code here
}

// 2) The first index i with A[i] > x (A.length if none).
function upperBound(A, x) {
  // your code here
}

// 3) How many elements of A lie in the closed range [a, b]?
function countInRange(A, a, b) {
  // your code here
}

// 4) The smallest integer t in [lo, hi] with pred(t) true, assuming pred is
//    false ... false true ... true on that range. If pred(hi) is false, return hi + 1.
function firstTrue(lo, hi, pred) {
  // your code here
}

// 5) Binary search on the answer. weights[i] are package weights, shipped in order;
//    each day the ship carries a consecutive group whose total is at most its capacity.
//    Return the minimum capacity that ships everything within D days.
//    (Hint: for a fixed capacity, a greedy pass tells you how many days you need: O(n).
//     So the whole thing is O(n log(sum of weights)).)
function minShipCapacity(weights, D) {
  // your code here
}

// For the timing experiment: build a sorted array of size n and answer n lowerBound queries.
function manyQueries(n) {
  const A = Array.from({ length: n }, (_, i) => 2 * i);
  let s = 0;
  for (let q = 0; q < n; q++) s += lowerBound(A, (q * 7919) % (2 * n));
  return s;
}
`;

export const solution = `function lowerBound(A, x) {
  let lo = 0, hi = A.length;            // invariant: A[0..lo-1] < x  and  A[hi..n-1] >= x
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (A[mid] < x) lo = mid + 1; else hi = mid;
  }
  return lo;
}

function upperBound(A, x) {
  let lo = 0, hi = A.length;            // invariant: A[0..lo-1] <= x  and  A[hi..n-1] > x
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (A[mid] <= x) lo = mid + 1; else hi = mid;
  }
  return lo;
}

function countInRange(A, a, b) {
  if (a > b) return 0;
  return upperBound(A, b) - lowerBound(A, a);
}

function firstTrue(lo, hi, pred) {
  let L = lo, H = hi + 1;               // the answer is in [L, H]; H = hi + 1 means "none"
  while (L < H) {
    const mid = L + Math.floor((H - L) / 2);
    if (pred(mid)) H = mid; else L = mid + 1;
  }
  return L;
}

function minShipCapacity(weights, D) {
  const daysNeeded = (cap) => {
    let days = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { days++; load = 0; }
      load += w;
    }
    return days;
  };
  const lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);
  return firstTrue(lo, hi, (cap) => daysNeeded(cap) <= D);   // more capacity never needs more days
}

function manyQueries(n) {
  const A = Array.from({ length: n }, (_, i) => 2 * i);
  let s = 0;
  for (let q = 0; q < n; q++) s += lowerBound(A, (q * 7919) % (2 * n));
  return s;
}
`;

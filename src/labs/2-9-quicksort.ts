// Starter and model-solution code for the lab in lesson 2.9.

export const starter = `// 1) Lomuto partition of A[lo..hi] around the pivot A[hi], IN PLACE.
//    Afterwards: A[lo..p−1] < pivot, A[p] = pivot, A[p+1..hi] ≥ pivot. Return p.
function partition(A, lo, hi) {
  // your code here
}

// 2) Three-way ("Dutch national flag") partition of the WHOLE array A around the VALUE p, in place.
//    Afterwards: A[0..lt−1] < p, A[lt..gt] === p, A[gt+1..] > p. Return [lt, gt].
//    (If p does not occur in A, then gt === lt − 1.) One pass, O(1) extra memory.
function dutchFlag(A, p) {
  // your code here
}

// 3) Quicksort. Return a NEW sorted array (numbers ascending); leave A unchanged.
//    It must be fast on EVERY input: random, already sorted, and all-equal arrays of 100 000 numbers.
//    Hint: a random pivot fixes sorted input. What fixes all-equal input?
function quickSort(A) {
  // your code here
}

// 4) Quickselect: the k-th smallest element (k = 0 is the minimum), expected O(n).
//    Do not modify A. Do not sort.
function quickSelect(A, k) {
  // your code here
}
`;

export const solution = `function partition(A, lo, hi) {
  const x = A[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (A[j] < x) { [A[i], A[j]] = [A[j], A[i]]; i++; }
  }
  [A[i], A[hi]] = [A[hi], A[i]];
  return i;
}

function dutchFlag(A, p) {
  let lt = 0, i = 0, gt = A.length - 1;
  while (i <= gt) {
    if (A[i] < p) { [A[lt], A[i]] = [A[i], A[lt]]; lt++; i++; }
    else if (A[i] > p) { [A[i], A[gt]] = [A[gt], A[i]]; gt--; }
    else i++;
  }
  return [lt, gt];
}

function quickSort(A) {
  const B = A.slice();
  const sort = (lo, hi) => {
    while (lo < hi) {
      const p = B[lo + Math.floor(Math.random() * (hi - lo + 1))];   // random pivot value
      let lt = lo, i = lo, gt = hi;                                    // three-way partition
      while (i <= gt) {
        if (B[i] < p) { [B[lt], B[i]] = [B[i], B[lt]]; lt++; i++; }
        else if (B[i] > p) { [B[i], B[gt]] = [B[gt], B[i]]; gt--; }
        else i++;
      }
      // recurse on the smaller side, loop on the larger: stack depth O(log n) even in the worst case
      if (lt - lo < hi - gt) { sort(lo, lt - 1); lo = gt + 1; }
      else { sort(gt + 1, hi); hi = lt - 1; }
    }
  };
  sort(0, B.length - 1);
  return B;
}

function quickSelect(A, k) {
  let B = A.slice();
  for (;;) {
    const p = B[Math.floor(Math.random() * B.length)];
    const less = B.filter((x) => x < p), equal = B.filter((x) => x === p).length;
    if (k < less.length) B = less;
    else if (k < less.length + equal) return p;
    else { k -= less.length + equal; B = B.filter((x) => x > p); }
  }
}
`;

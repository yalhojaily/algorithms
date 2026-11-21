// Starter and model-solution code for the lab in lesson 2.11.

export const starter = `// No comparisons between elements in this lab: use keys as array indices.

// 1) Counting sort. A holds integers in 0..k−1. Return a NEW sorted array in Θ(n + k).
function countingSort(A, k) {
  // your code here
}

// 2) Stable counting sort by key: key(x) is an integer in 0..k−1.
//    Return a NEW array sorted by key; elements with equal keys keep their original order.
function countingSortBy(A, key, k) {
  // your code here
}

// 3) LSD radix sort for non-negative integers below 2^31. Return a NEW sorted array.
//    Use countingSortBy with base 256: four passes, one per byte, least significant first.
//    (x >>> (8 * d)) & 255 is byte d of x.
function radixSort(A) {
  // your code here
}

// 4) Bucket sort for numbers in [0, 1): n buckets, bucket i gets [i/n, (i+1)/n),
//    sort each bucket (insertion sort is fine: buckets are tiny on average), then concatenate.
//    Return a NEW sorted array. Expected Θ(n) for uniformly random input.
function bucketSort(A) {
  // your code here
}
`;

export const solution = `function countingSort(A, k) {
  const C = new Array(k).fill(0);
  for (const x of A) C[x]++;
  const out = [];
  for (let v = 0; v < k; v++) for (let t = 0; t < C[v]; t++) out.push(v);
  return out;
}

function countingSortBy(A, key, k) {
  const C = new Array(k).fill(0);
  for (const x of A) C[key(x)]++;
  for (let v = 1; v < k; v++) C[v] += C[v - 1];        // C[v] = number of keys ≤ v
  const out = new Array(A.length);
  for (let i = A.length - 1; i >= 0; i--) out[--C[key(A[i])]] = A[i];   // right to left: stable
  return out;
}

function radixSort(A) {
  let B = A.slice();
  for (let d = 0; d < 4; d++) B = countingSortBy(B, (x) => (x >>> (8 * d)) & 255, 256);
  return B;
}

function bucketSort(A) {
  const n = A.length;
  const buckets = Array.from({ length: n }, () => []);
  for (const x of A) buckets[Math.floor(x * n)].push(x);
  const out = [];
  for (const b of buckets) {
    for (let i = 1; i < b.length; i++) {
      const v = b[i]; let j = i - 1;
      while (j >= 0 && b[j] > v) { b[j + 1] = b[j]; j--; }
      b[j + 1] = v;
    }
    for (const x of b) out.push(x);
  }
  return out;
}
`;

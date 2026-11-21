// Starter and model-solution code for the lab in book section 1.8.

export const starter = `// k is 1-based, as in the book: select(A, 1) is the minimum, select(A, n) the maximum.
// None of the functions may modify A. The elements of A are numbers (duplicates allowed).

// 1) Quickselect with a uniformly random pivot: expected O(n).
function quickSelect(A, k) {
  // your code here
}

// 2) The median of an array of at most 5 numbers (for an even length, the lower median).
//    Brute force is fine: it is O(1).
function medianOfFive(B) {
  // your code here
}

// 3) The Blum-Floyd-Pratt-Rivest-Tarjan algorithm: O(n) in the WORST case, no randomness.
//    For small n (say n <= 25) use brute force. Otherwise: medians of blocks of 5,
//    mom = momSelect(medians, ceil(m / 2)), partition around mom, and recurse on ONE side.
function momSelect(A, k) {
  // your code here
}
`;

export const solution = `function quickSelect(A, k) {
  let B = A;
  for (;;) {
    if (B.length === 1) return B[0];
    const p = B[Math.floor(Math.random() * B.length)];
    const less = B.filter((x) => x < p), equal = B.filter((x) => x === p).length;
    if (k <= less.length) B = less;
    else if (k <= less.length + equal) return p;
    else { k -= less.length + equal; B = B.filter((x) => x > p); }
  }
}

function medianOfFive(B) {
  const S = B.slice().sort((a, b) => a - b);
  return S[(S.length - 1) >> 1];
}

function momSelect(A, k) {
  if (A.length <= 25) return A.slice().sort((a, b) => a - b)[k - 1];
  const M = [];
  for (let i = 0; i < A.length; i += 5) M.push(medianOfFive(A.slice(i, i + 5)));
  const mom = momSelect(M, Math.ceil(M.length / 2));
  // three-way partition, so that duplicates of mom cannot slow us down
  const less = [], greater = [];
  let equal = 0;
  for (const x of A) { if (x < mom) less.push(x); else if (x > mom) greater.push(x); else equal++; }
  if (k <= less.length) return momSelect(less, k);
  if (k <= less.length + equal) return mom;
  return momSelect(greater, k - less.length - equal);
}
`;

// Starter and model-solution code for the lab in lesson 1.4.

export const starter = `// Part 1: one problem, three growth rates.
// Each function returns true if the array A contains some value twice.

// Θ(n²): compare every pair i < j.
function hasDupPairs(A) {
  // your code here
}

// Θ(n log n): sort a COPY, then duplicates are neighbours.
// (Built-in sort is allowed here; it takes Θ(n log n) comparisons.)
function hasDupSort(A) {
  // your code here
}

// Θ(n) expected: remember what you have seen in a Set.
function hasDupSet(A) {
  // your code here
}

// Part 2: the doubling experiment, done on step counts instead of seconds.
// T is a function giving the number of steps for size n.
// Return log₂(T(2n) / T(n)). For T = Θ(n^k) this tends to k as n grows.
function doublingExponent(T, n) {
  // your code here
}
`;

export const solution = `function hasDupPairs(A) {
  for (let i = 0; i < A.length; i++)
    for (let j = i + 1; j < A.length; j++)
      if (A[i] === A[j]) return true;
  return false;
}

function hasDupSort(A) {
  const B = A.slice().sort((a, b) => a - b);
  for (let i = 1; i < B.length; i++) if (B[i] === B[i - 1]) return true;
  return false;
}

function hasDupSet(A) {
  const seen = new Set();
  for (const x of A) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

function doublingExponent(T, n) {
  return Math.log2(T(2 * n) / T(n));
}
`;

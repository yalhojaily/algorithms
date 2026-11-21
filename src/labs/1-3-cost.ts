// Starter and model-solution code for the lab in lesson 1.3.

export const starter = `// Part 1: count by formula.
// Each function returns the EXACT number of line executions of the pseudocode in the lesson,
// with the same convention as the cost table: a loop header runs once more than its body.
// The tests compare your formula with a real counter, for many values of n.

// SUM: s ← 0 / for i ← 0 to n−1 / s ← s + A[i] / return s
function T_sum(n) {
  // your code here
}

// ZERO-PAIRS on an array with NO zero-sum pairs (so the line c ← c + 1 never runs).
function T_pairs(n) {
  // your code here
}

// ZERO-TRIPLES on an array with NO zero-sum triples.
function T_triples(n) {
  // your code here
}

// BITS(N): c ← 0 / while N > 0: N ← ⌊N/2⌋; c ← c + 1 / return c   (N >= 1)
// Hint: Math.log2 is not exact for huge N; count the bits with a loop or with N.toString(2).length.
function T_bits(N) {
  // your code here
}

// Peak number of stack frames when RSUM(A, n) runs.
function S_rsum(n) {
  // your code here
}

// Part 2: the real thing. Return the number of pairs i < j with A[i] + A[j] === 0.
// Use the double loop from the lesson; the timing experiment below runs it.
function countZeroPairs(A) {
  // your code here
}
`;

export const solution = `function T_sum(n) {
  return 1 + (n + 1) + n + 1;              // 2n + 3
}

function T_pairs(n) {
  return 1 + (n + 1) + n * (n + 1) / 2 + n * (n - 1) / 2 + 1;   // n² + n + 3
}

function T_triples(n) {
  const C3 = (m) => m * (m - 1) * (m - 2) / 6;
  return 1 + (n + 1) + n * (n + 1) / 2 + C3(n + 1) + C3(n) + 1;  // n³/3 + 5n/3 + 3
}

function T_bits(N) {
  const b = N.toString(2).length;          // number of binary digits
  return 1 + (b + 1) + b + b + 1;          // 3b + 3
}

function S_rsum(n) {
  return n + 1;                            // RSUM(n), RSUM(n−1), …, RSUM(0) all wait at once
}

function countZeroPairs(A) {
  let c = 0;
  for (let i = 0; i < A.length; i++)
    for (let j = i + 1; j < A.length; j++)
      if (A[i] + A[j] === 0) c++;
  return c;
}
`;

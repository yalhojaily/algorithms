// Starter and model-solution code for the lab in lesson 1.1.

export const starter = `// Rules for this lab — write as if you were on a word-RAM:
//   use only loops, array indexing, arithmetic and comparisons.
//   No Math.max(...A), no A.includes, no Set, no sort: each of those hides a loop.

// 1) The largest element of a non-empty array.
function findMax(A) {
  // your code here
}

// 2) Does any value appear twice? Compare every pair (i < j).
function hasDuplicatePairs(A) {
  // your code here
}

// 3) Same question, when every value is a day of the year 1..366:
//    use a direct-access table T of 367 booleans, one pass over A.
function hasDuplicateDays(A) {
  // your code here
}

// 4) How many comparisons A[i] = A[j] does hasDuplicatePairs make
//    in the worst case (no duplicate)? Give a formula, not a loop.
function comparisonsWorst(n) {
  // your code here
}

// 5) Peasant multiplication (halve x, double y, add y when x is odd).
//    Return [x * y, numberOfLoopIterations]. Use only +, halving and parity.
function peasantMultiply(x, y) {
  // your code here
}
`;

export const solution = `function findMax(A) {
  let m = A[0];
  for (let i = 1; i < A.length; i++) if (A[i] > m) m = A[i];
  return m;
}

function hasDuplicatePairs(A) {
  for (let i = 0; i < A.length; i++)
    for (let j = i + 1; j < A.length; j++)
      if (A[i] === A[j]) return true;
  return false;
}

function hasDuplicateDays(A) {
  const T = new Array(367).fill(false);
  for (let i = 0; i < A.length; i++) {
    if (T[A[i]]) return true;
    T[A[i]] = true;
  }
  return false;
}

function comparisonsWorst(n) {
  return n * (n - 1) / 2;
}

function peasantMultiply(x, y) {
  let prod = 0, steps = 0;
  while (x > 0) {
    if (x % 2 === 1) prod = prod + y;   // invariant: prod + x·y = original x·y
    x = Math.floor(x / 2);
    y = y + y;
    steps++;
  }
  return [prod, steps];
}
`;

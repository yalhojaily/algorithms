// Starter and model-solution code for the lab in lesson 1.6.

export const starter = `// Write every function RECURSIVELY: no for or while loops
// (the one exception: in flatten you may loop over the children of an array).
// For each one, ask the two questions of the lesson:
//   1. What is the base case?
//   2. If the recursive call on a SMALLER input returns the right answer, how do I finish?

// 1) x to the power n, for an integer n >= 0, using about log₂ n multiplications.
//    Use x^n = (x^(n/2))² for even n. Do NOT call power twice in one call.
function power(x, n) {
  // your code here
}

// 2) Is the string a palindrome? ("" and one-letter strings are.)
function isPalindrome(s) {
  // your code here
}

// 3) The moves that solve the Towers of Hanoi with n disks from peg 'A' to peg 'C'.
//    Return an array of moves, each move a two-letter string such as "AC".
function hanoi(n, from = 'A', to = 'C', via = 'B') {
  // your code here
}

// 4) All subsets of the array A (any order of subsets; inside each subset keep A's order).
//    subsets([1, 2]) → [[], [2], [1], [1, 2]] in some order.
function subsets(A) {
  // your code here
}

// 5) Flatten nested arrays of any depth: flatten([1, [2, [3, [4]]], 5]) → [1, 2, 3, 4, 5].
//    (Array.isArray tells you whether something is an array. Do not use .flat.)
function flatten(A) {
  // your code here
}
`;

export const solution = `function power(x, n) {
  if (n === 0) return 1;
  const h = power(x, Math.floor(n / 2));   // one recursive call, on n/2
  return n % 2 === 0 ? h * h : h * h * x;
}

function isPalindrome(s) {
  if (s.length <= 1) return true;
  return s[0] === s[s.length - 1] && isPalindrome(s.slice(1, -1));
}

function hanoi(n, from = 'A', to = 'C', via = 'B') {
  if (n === 0) return [];
  return [
    ...hanoi(n - 1, from, via, to),        // clear the way: n − 1 disks onto the spare peg
    from + to,                             // move the largest disk
    ...hanoi(n - 1, via, to, from),        // bring the n − 1 disks back on top of it
  ];
}

function subsets(A) {
  if (A.length === 0) return [[]];
  const rest = subsets(A.slice(1));        // subsets without A[0]
  return [...rest, ...rest.map((S) => [A[0], ...S])];
}

function flatten(A) {
  if (!Array.isArray(A)) return [A];
  const out = [];
  for (const x of A) out.push(...flatten(x));  // a loop over the children is fine here
  return out;
}
`;

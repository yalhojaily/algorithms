// Starter and model-solution code for the lab in lesson 0.4.

export const starter = `// A set is an array of numbers with no repeats, e.g. [3, 1, 4].
// Every function that returns a set must return it sorted in increasing order.
// Tip: new Set(arr) gives you fast membership tests with .has(x).

// 1) A ∪ B
function union(A, B) {
  // your code here
}

// 2) A ∩ B
function intersection(A, B) {
  // your code here
}

// 3) A − B
function difference(A, B) {
  // your code here
}

// 4) A ⊆ B ?
function isSubset(A, B) {
  // your code here
}

// 5) P(S): every subset of S. Order of the subsets does not matter.
//    Hint: count mask = 0 … 2ⁿ − 1; element j is in the subset when bit j of mask is 1,
//    i.e. when (mask >> j) & 1 is 1.
function powerSet(S) {
  // your code here
}

// 6) A × B: all pairs [a, b], a from A (in order), then b from B (in order).
//    cartesian([1, 2], ['x', 'y']) → [[1,'x'], [1,'y'], [2,'x'], [2,'y']]
function cartesian(A, B) {
  // your code here
}
`;

export const solution = `const sorted = (xs) => [...xs].sort((a, b) => a - b);

function union(A, B) {
  return sorted(new Set([...A, ...B]));
}

function intersection(A, B) {
  const b = new Set(B);
  return sorted(A.filter((x) => b.has(x)));
}

function difference(A, B) {
  const b = new Set(B);
  return sorted(A.filter((x) => !b.has(x)));
}

function isSubset(A, B) {
  const b = new Set(B);
  return A.every((x) => b.has(x));
}

function powerSet(S) {
  const n = S.length;
  const out = [];
  for (let mask = 0; mask < 2 ** n; mask++) {
    out.push(S.filter((_, j) => (mask >> j) & 1));
  }
  return out;
}

function cartesian(A, B) {
  return A.flatMap((a) => B.map((b) => [a, b]));
}
`;

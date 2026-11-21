// Starter and model-solution code for the lab in lesson 1.5.

export const starter = `// Exact average-case analysis by brute force: run on EVERY input of size n.

// 1) All permutations of [1, 2, ..., n], as an array of arrays (any order).
//    permutations(3) has 6 arrays. permutations(0) is [[]].
function permutations(n) {
  // your code here
}

// 2) Number of inversions: pairs i < j with A[i] > A[j].
function inversions(A) {
  // your code here
}

// 3) Number of "left-to-right maxima" AFTER the first element:
//    positions i ≥ 1 where A[i] is larger than everything before it.
//    (This is how many times MAX executes m ← A[i].)
function newMaxima(A) {
  // your code here
}

// 4) The average of cost(P) over all permutations P of size n.
function averageCost(n, cost) {
  // your code here
}

// 5) The harmonic number H_n = 1 + 1/2 + ... + 1/n.
function harmonic(n) {
  // your code here
}
`;

export const solution = `function permutations(n) {
  if (n === 0) return [[]];
  const out = [];
  for (const p of permutations(n - 1))
    for (let pos = 0; pos <= p.length; pos++)       // insert n at every position
      out.push([...p.slice(0, pos), n, ...p.slice(pos)]);
  return out;
}

function inversions(A) {
  let c = 0;
  for (let i = 0; i < A.length; i++)
    for (let j = i + 1; j < A.length; j++)
      if (A[i] > A[j]) c++;
  return c;
}

function newMaxima(A) {
  let m = A[0], c = 0;
  for (let i = 1; i < A.length; i++) if (A[i] > m) { m = A[i]; c++; }
  return c;
}

function averageCost(n, cost) {
  const P = permutations(n);
  let s = 0;
  for (const p of P) s += cost(p);
  return s / P.length;
}

function harmonic(n) {
  let h = 0;
  for (let k = 1; k <= n; k++) h += 1 / k;
  return h;
}
`;

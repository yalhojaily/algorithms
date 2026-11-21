// Starter and model-solution code for the lab in lesson 0.2.

export const starter = `// D is an array (the domain); p is a predicate: a function returning true or false.

// 1) ∀x ∈ D. p(x)  — stop at the first x that fails.
function forAll(D, p) {
  // your code here
}

// 2) ∃x ∈ D. p(x)  — stop at the first x that works.
function exists(D, p) {
  // your code here
}

// 3) The first x in D with p(x) false, or null if there is none.
function counterexample(D, p) {
  // your code here
}

// 4) No value appears twice in arr:
//    ∀i ∀j (i ≠ j → arr[i] ≠ arr[j])   — write it with forAll twice.
function noDuplicates(arr) {
  // your code here
}

// 5) Goldbach up to N: every even m with 4 ≤ m ≤ N is a sum of two primes.
//    ∀m ∈ {4, 6, …, N}. ∃p ∈ {2, …, m/2}. isPrime(p) ∧ isPrime(m − p)
function goldbach(N) {
  // your code here
}

// ---- helpers (already written; you may use them) ----
function isPrime(k) {
  if (k < 2) return false;
  for (let d = 2; d * d <= k; d++) if (k % d === 0) return false;
  return true;
}

// range(1, 5) → [1, 2, 3, 4, 5]    range(4, 10, 2) → [4, 6, 8, 10]
function range(a, b, step = 1) {
  const out = [];
  for (let k = a; k <= b; k += step) out.push(k);
  return out;
}
`;

export const solution = `function forAll(D, p) {
  for (const x of D) if (!p(x)) return false;
  return true;
}

function exists(D, p) {
  for (const x of D) if (p(x)) return true;
  return false;
}

function counterexample(D, p) {
  for (const x of D) if (!p(x)) return x;
  return null;
}

function noDuplicates(arr) {
  const I = range(0, arr.length - 1);
  return forAll(I, (i) => forAll(I, (j) => i === j || arr[i] !== arr[j]));
}

function goldbach(N) {
  return forAll(range(4, N, 2), (m) =>
    exists(range(2, m / 2), (p) => isPrime(p) && isPrime(m - p)));
}

// ---- helpers (already written; you may use them) ----
function isPrime(k) {
  if (k < 2) return false;
  for (let d = 2; d * d <= k; d++) if (k % d === 0) return false;
  return true;
}

// range(1, 5) → [1, 2, 3, 4, 5]    range(4, 10, 2) → [4, 6, 8, 10]
function range(a, b, step = 1) {
  const out = [];
  for (let k = a; k <= b; k += step) out.push(k);
  return out;
}
`;

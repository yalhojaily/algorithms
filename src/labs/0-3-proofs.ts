// Starter and model-solution code for the lab in lesson 0.3.

export const starter = `// 1) The smallest factor d ≥ 2 of n (n ≥ 2). If n is prime, that is n itself.
//    Only try d while d * d <= n — why is that enough? (see section 6 of the lesson)
function smallestFactor(n) {
  // your code here
}

// 2) n is prime when n ≥ 2 and its smallest factor is n.
function isPrime(n) {
  // your code here
}

// 3) Euclid: a prime that is NOT in the list.
//    euclidNext([2, 3, 5, 7, 11, 13]) → 59   (because 30031 = 59 · 509)
function euclidNext(primes) {
  // your code here
}

// 4) Proof by cases, done by a computer: every integer n is congruent to one of
//    0, 1, …, m−1 (mod m), and n² mod m depends only on that remainder.
//    Return the sorted list of distinct values of n² mod m.
//    squaresMod(4) → [0, 1]
function squaresMod(m) {
  // your code here
}

// 5) Can a² + b² leave remainder r when divided by m, for some integers a, b?
//    (Use squaresMod: try every pair of possible square remainders.)
function sumOfTwoSquaresMod(r, m) {
  // your code here
}
`;

export const solution = `function smallestFactor(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return d;
  return n;
}

function isPrime(n) {
  return n >= 2 && smallestFactor(n) === n;
}

function euclidNext(primes) {
  const N = primes.reduce((p, q) => p * q, 1) + 1;
  return smallestFactor(N);
}

function squaresMod(m) {
  const s = new Set();
  for (let r = 0; r < m; r++) s.add((r * r) % m);
  return [...s].sort((a, b) => a - b);
}

function sumOfTwoSquaresMod(r, m) {
  const sq = squaresMod(m);
  return sq.some((a) => sq.some((b) => (a + b) % m === r));
}
`;

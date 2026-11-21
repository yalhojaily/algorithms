// Starter and model-solution code for the lab in book section 1.10.

export const starter = `// The point of section 1.10: a need not be a number, only something we can multiply.
// So the first function takes the multiplication as a parameter, and we count how often you call it.

// 1) Compute a^n (n ≥ 1) with O(log n) calls to mul. Piṅgala or Peasant: your choice.
function power(a, n, mul) {
  // your code here
}

// 2) a^n mod m with BigInt (a, n, m are BigInt, m ≥ 2). Use power with the right mul.
function modPow(a, n, m) {
  // your code here
}

// 3) The n-th Fibonacci number mod 1 000 000 007, for n up to 10^18 (n is a BigInt; F(0) = 0, F(1) = 1).
//    Hint: [[1,1],[1,0]]^n = [[F(n+1), F(n)], [F(n), F(n−1)]]. Return a BigInt.
function fibMod(n) {
  // your code here
}
`;

export const solution = `function power(a, n, mul) {
  // Piṅgala: a^n = (a^⌊n/2⌋)² · (a if n is odd)
  if (n === 1) return a;
  const x = power(a, Math.floor(n / 2), mul);
  const sq = mul(x, x);
  return n % 2 ? mul(sq, a) : sq;
}

function modPow(a, n, m) {
  // n can be huge, so iterate over its bits (Peasant) instead of recursing on a Number
  let result = 1n, sq = a % m;
  while (n > 0n) {
    if (n & 1n) result = (result * sq) % m;
    sq = (sq * sq) % m;
    n >>= 1n;
  }
  return result;
}

function fibMod(n) {
  const P = 1000000007n;
  const mul = (X, Y) => [
    [(X[0][0] * Y[0][0] + X[0][1] * Y[1][0]) % P, (X[0][0] * Y[0][1] + X[0][1] * Y[1][1]) % P],
    [(X[1][0] * Y[0][0] + X[1][1] * Y[1][0]) % P, (X[1][0] * Y[0][1] + X[1][1] * Y[1][1]) % P],
  ];
  let R = [[1n, 0n], [0n, 1n]], S = [[1n, 1n], [1n, 0n]];
  while (n > 0n) {
    if (n & 1n) R = mul(R, S);
    S = mul(S, S);
    n >>= 1n;
  }
  return R[0][1];
}
`;

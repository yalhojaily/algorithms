// Starter and model-solution code for the lab in book section 0.2.

export const starter = `// Three multiplication algorithms from section 0.2, each built from different primitive operations.

// 1) Fibonacci's lattice multiplication.
//    X and Y are arrays of decimal digits, least significant first: 934 is [4, 3, 9].
//    Return Z, the digits of the product, also least significant first, with length exactly m + n
//    (so it may end with zeros). Primitives allowed: single-digit ×, +, mod 10, ⌊/10⌋.
function latticeMultiply(X, Y) {
  // your code here
}

// 2) Peasant multiplication (duplation and mediation): only parity, +, doubling and halving.
//    x, y are non-negative integers. No * anywhere!
function peasantMultiply(x, y) {
  // your code here
}

// 3) The Egyptian variant (footnote 10): no halving and no parity test.
//    Build two tables by doubling: the powers of 2 up to x, and the same powers times y.
//    Then walk down the first table subtracting greedily from x, and add the matching entries
//    of the second table. Again: no *, no /, no %.
function egyptianMultiply(x, y) {
  // your code here
}
`;

export const solution = `function latticeMultiply(X, Y) {
  const m = X.length, n = Y.length, Z = new Array(m + n).fill(0);
  let hold = 0;
  for (let k = 0; k < m + n; k++) {
    for (let i = Math.max(0, k - n + 1); i <= Math.min(k, m - 1); i++) hold += X[i] * Y[k - i];
    Z[k] = hold % 10;
    hold = Math.floor(hold / 10);
  }
  return Z;
}

function peasantMultiply(x, y) {
  let prod = 0;
  while (x > 0) {
    if (x % 2 === 1) prod = prod + y;   // parity
    x = Math.floor(x / 2);             // mediation
    y = y + y;                         // duplation
  }
  return prod;
}

function egyptianMultiply(x, y) {
  const pows = [1], muls = [y];
  while (pows[pows.length - 1] + pows[pows.length - 1] <= x) {
    pows.push(pows[pows.length - 1] + pows[pows.length - 1]);
    muls.push(muls[muls.length - 1] + muls[muls.length - 1]);
  }
  let prod = 0;
  for (let i = pows.length - 1; i >= 0; i--) {
    if (pows[i] <= x) { x = x - pows[i]; prod = prod + muls[i]; }
  }
  return prod;
}
`;

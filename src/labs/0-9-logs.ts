// Starter and model-solution code for the lab in lesson 0.9.

export const starter = `// No Math.log in 1–3: use only multiplication / division by 2 (or bit shifts).

// 1) ⌊log₂ n⌋ for n ≥ 1: how many times can you halve n (rounding down) before reaching 1?
//    ilog2(1) → 0, ilog2(8) → 3, ilog2(9) → 3
function ilog2(n) {
  // your code here
}

// 2) How many bits are needed to write n ≥ 1 in binary?   bitLength(8) → 4  (1000)
function bitLength(n) {
  // your code here
}

// 3) ⌈log₂ n⌉ for n ≥ 1: the number of yes/no questions that always finds a number in 1..n.
function questionsNeeded(n) {
  // your code here
}

// 4) log of x in base b, using Math.log and the change-of-base rule.
function logBase(x, b) {
  // your code here
}

// 5) b^e mod m by repeated multiplication: e multiplications.  (m < 2^26 so products stay exact)
function naivePowMod(b, e, m) {
  // your code here
}

// 6) b^e mod m by repeated squaring. Return [result, numberOfMultiplications].
//    Idea: b^e = (b^(e/2))² if e is even, and b · b^(e−1) if e is odd.
function fastPowMod(b, e, m) {
  // your code here
}
`;

export const solution = `function ilog2(n) {
  let k = 0;
  while (n >= 2) { n = Math.floor(n / 2); k++; }
  return k;
}

function bitLength(n) {
  return ilog2(n) + 1;
}

function questionsNeeded(n) {
  let q = 0, size = n;
  while (size > 1) { size = Math.ceil(size / 2); q++; }
  return q;
}

function logBase(x, b) {
  return Math.log(x) / Math.log(b);
}

function naivePowMod(b, e, m) {
  let r = 1 % m;
  for (let i = 0; i < e; i++) r = (r * b) % m;
  return r;
}

function fastPowMod(b, e, m) {
  let result = 1 % m, base = b % m, mults = 0;
  while (e > 0) {
    if (e % 2 === 1) { result = (result * base) % m; mults++; }
    e = Math.floor(e / 2);
    if (e > 0) { base = (base * base) % m; mults++; }
  }
  return [result, mults];
}
`;

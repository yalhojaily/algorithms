// Starter and model-solution code for the lab in lesson 0.8.

export const starter = `// Use CLOSED FORMS (no loops) in 1, 2, 4, 5. Use loops in 3, 6, 7.

// 1) a + (a + d) + (a + 2d) + … : the first n terms.
function arithmeticSum(a, d, n) {
  // your code here (closed form)
}

// 2) a + a·r + a·r² + … + a·r^(n−1). Careful with r = 1.
function geometricSum(a, r, n) {
  // your code here (closed form)
}

// 3) H(n) = 1 + 1/2 + 1/3 + … + 1/n
function harmonic(n) {
  // your code here (a loop is fine)
}

// 4) 1² + 2² + … + n²
function sumSquares(n) {
  // your code here (closed form)
}

// 5) 1/(1·2) + 1/(2·3) + … + 1/(n(n+1))   — telescoping!
function sumInvProducts(n) {
  // your code here (closed form)
}

// 6) Run this loop and return how many times the inner body runs:
//      for i = 1..n:  for j = i; j <= n; j += i:  body
function countHarmonic(n) {
  // your code here
}

// 7) ln(n!) = ln 1 + ln 2 + … + ln n   (use Math.log; n! itself would overflow)
function lnFactorial(n) {
  // your code here
}
`;

export const solution = `function arithmeticSum(a, d, n) {
  return n * a + d * (n * (n - 1)) / 2;
}

function geometricSum(a, r, n) {
  if (r === 1) return a * n;
  return a * (1 - r ** n) / (1 - r);
}

function harmonic(n) {
  let s = 0;
  for (let i = 1; i <= n; i++) s += 1 / i;
  return s;
}

function sumSquares(n) {
  return n * (n + 1) * (2 * n + 1) / 6;
}

function sumInvProducts(n) {
  return n / (n + 1);   // 1/(k(k+1)) = 1/k − 1/(k+1), and the middle cancels
}

function countHarmonic(n) {
  let c = 0;
  for (let i = 1; i <= n; i++)
    for (let j = i; j <= n; j += i) c++;
  return c;
}

function lnFactorial(n) {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}
`;

// Starter and model-solution code for the lab in book section 3.8.

export const starter = `// FastSubsetSum: the table S[i][t] = "some subset of X[i..n] sums to t" (1-based i, row n+1 is the base).

// 1) Decide whether some subset of X sums to T, in O(nT) time.
function fastSubsetSum(X, T) {
  // your code here
}

// 2) Return one such subset (an array of values), or null. Walk the table from S[1][T].
function fastConstructSubset(X, T) {
  // your code here
}
`;

export const solution = `function fastSubsetSum(X, T) {
  const n = X.length;
  const S = Array.from({ length: n + 2 }, () => new Array(T + 1).fill(false));
  S[n + 1][0] = true;
  for (let i = n; i >= 1; i--) {
    S[i][0] = true;
    for (let t = 1; t < X[i - 1] && t <= T; t++) S[i][t] = S[i + 1][t];
    for (let t = X[i - 1]; t <= T; t++) S[i][t] = S[i + 1][t] || S[i + 1][t - X[i - 1]];
  }
  return S[1][T];
}

function fastConstructSubset(X, T) {
  const n = X.length;
  const S = Array.from({ length: n + 2 }, () => new Array(T + 1).fill(false));
  S[n + 1][0] = true;
  for (let i = n; i >= 1; i--)
    for (let t = 0; t <= T; t++) S[i][t] = t === 0 || S[i + 1][t] || (t >= X[i - 1] && S[i + 1][t - X[i - 1]]);
  if (!S[1][T]) return null;
  const out = [];
  let t = T;
  for (let i = 1; i <= n && t > 0; i++) if (!S[i + 1][t]) { out.push(X[i - 1]); t -= X[i - 1]; }
  return out;
}
`;

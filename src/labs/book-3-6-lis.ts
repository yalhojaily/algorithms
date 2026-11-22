// Starter and model-solution code for the lab in book section 3.6.

export const starter = `// The two dynamic programs for the longest increasing subsequence, plus the subsequence itself.

// 1) FastLIS: the table LISbigger[i][j] (with sentinel A[0] = −∞), filled column by column from the right.
function fastLIS(A) {
  // your code here
}

// 2) FastLIS2: the one-dimensional table LISfirst[i], filled from the right.
function fastLIS2(A) {
  // your code here
}

// 3) Return one longest increasing subsequence (the values), using the LISfirst table.
function lisSequence(A) {
  // your code here
}
`;

export const solution = `function fastLIS(A) {
  const n = A.length, B = [-Infinity, ...A];
  const L = Array.from({ length: n + 1 }, () => new Array(n + 2).fill(0));   // L[i][n+1] = 0
  for (let j = n; j >= 1; j--)
    for (let i = 0; i < j; i++) {
      const skip = L[i][j + 1];
      L[i][j] = B[i] >= B[j] ? skip : Math.max(skip, 1 + L[j][j + 1]);
    }
  return L[0][1];
}

function fastLIS2(A) {
  const n = A.length, B = [-Infinity, ...A], L = new Array(n + 1).fill(1);
  for (let i = n; i >= 0; i--)
    for (let j = i + 1; j <= n; j++)
      if (B[j] > B[i] && 1 + L[j] > L[i]) L[i] = 1 + L[j];
  return L[0] - 1;
}

function lisSequence(A) {
  const n = A.length, B = [-Infinity, ...A], L = new Array(n + 1).fill(1), nxt = new Array(n + 1).fill(-1);
  for (let i = n; i >= 0; i--)
    for (let j = i + 1; j <= n; j++)
      if (B[j] > B[i] && 1 + L[j] > L[i]) { L[i] = 1 + L[j]; nxt[i] = j; }
  const out = [];
  for (let i = nxt[0]; i !== -1; i = nxt[i]) out.push(B[i]);
  return out;
}
`;

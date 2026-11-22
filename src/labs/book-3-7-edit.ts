// Starter and model-solution code for the lab in book section 3.7.

export const starter = `// Edit distance with insertions, deletions and substitutions, all costing 1.

// 1) The table Edit[0..m][0..n] in row-major order; return Edit[m][n].
function editDistance(A, B) {
  // your code here
}

// 2) Return an optimal alignment as two equal-length strings, with "-" for a gap,
//    e.g. ["FOO-D", "MONEY"]. Rebuild it from the table by walking back from the corner.
function alignment(A, B) {
  // your code here
}
`;

export const solution = `function editDistance(A, B) {
  const m = A.length, n = B.length;
  const E = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      E[i][j] = Math.min(E[i][j - 1] + 1, E[i - 1][j] + 1, E[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
  return E[m][n];
}

function alignment(A, B) {
  const m = A.length, n = B.length;
  const E = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      E[i][j] = Math.min(E[i][j - 1] + 1, E[i - 1][j] + 1, E[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
  let i = m, j = n, top = "", bot = "";
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && E[i][j] === E[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1)) { top = A[i - 1] + top; bot = B[j - 1] + bot; i--; j--; }
    else if (i > 0 && E[i][j] === E[i - 1][j] + 1) { top = A[i - 1] + top; bot = "-" + bot; i--; }
    else { top = "-" + top; bot = B[j - 1] + bot; j--; }
  }
  return [top, bot];
}
`;

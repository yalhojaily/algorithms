// Starter and model-solution code for the lab in book section 3.9.

export const starter = `// OptimalBST in O(n³): F[i][k] by its own little dynamic program, then OptCost[i][k] diagonal by diagonal.
// f is 0-based here (f[0] is the first key); you may use 1-based tables inside if you prefer.

// 1) The optimal total cost.
function optimalBST(f) {
  // your code here
}

// 2) The optimal tree itself: null or { key, left, right } with key an index into f.
function optimalTree(f) {
  // your code here
}
`;

export const solution = `function tables(f) {
  const n = f.length;
  const F = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let k = i; k <= n; k++) F[i][k] = F[i][k - 1] + f[k - 1];
  const C = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0));
  const R = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0));
  for (let d = 0; d < n; d++)
    for (let i = 1; i + d <= n; i++) {
      const k = i + d;
      let best = Infinity;
      for (let r = i; r <= k; r++) {
        const c = C[i][r - 1] + (r + 1 <= n + 1 ? C[r + 1][k] : 0);
        if (c < best) { best = c; R[i][k] = r; }
      }
      C[i][k] = best + F[i][k];
    }
  return { C, R };
}

function optimalBST(f) {
  return f.length ? tables(f).C[1][f.length] : 0;
}

function optimalTree(f) {
  const { R } = tables(f);
  const build = (i, k) => (i > k ? null : { key: R[i][k] - 1, left: build(i, R[i][k] - 1), right: build(R[i][k] + 1, k) });
  return build(1, f.length);
}
`;

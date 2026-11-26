// Starter and model-solution code for the lab in book section 9.7.

export const starter = `// Square matrices as arrays of rows; Infinity is allowed.

// 1) The min-plus ("funny") product: C[i][j] = min over k of (A[i][k] + B[k][j]).
function minPlus(A, B) {
  // your code here
}

// 2) The k-th min-plus power of W, for k ≥ 1, by repeated squaring (O(lg k) products).
//    If W is a weight matrix with 0 on the diagonal, this is "shortest walks with at most k edges".
function minPlusPower(W, k) {
  // your code here
}
`;

export const solution = `function minPlus(A, B) {
  const n = A.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    let best = Infinity;
    for (let k = 0; k < n; k++) best = Math.min(best, A[i][k] + B[k][j]);
    return best;
  }));
}

function minPlusPower(W, k) {
  if (k === 1) return W;
  const half = minPlusPower(W, Math.floor(k / 2)), sq = minPlus(half, half);
  return k % 2 === 0 ? sq : minPlus(sq, W);        // the same idea as fast exponentiation (1.10)
}
`;

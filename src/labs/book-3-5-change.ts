// Starter and model-solution code for the lab in book section 3.5.

export const starter = `// Making change with the fewest bills. d is an array of denominations that always contains 1.

// 1) The greedy algorithm: repeatedly take the largest bill that does not exceed what is left.
//    Return the number of bills.
function greedyChange(k, d) {
  // your code here
}

// 2) MinBills(k) by dynamic programming: MinBills(0) = 0, MinBills(k) = 1 + min over x ≤ k of MinBills(k − x).
function minBills(k, d) {
  // your code here
}

// 3) The smallest amount (≤ limit) where greedy uses more bills than necessary, or null.
function firstGreedyFailure(d, limit) {
  // your code here
}
`;

export const solution = `function greedyChange(k, d) {
  const ds = [...d].sort((a, b) => b - a);
  let count = 0;
  for (const x of ds) while (k >= x) { k -= x; count++; }
  return count;
}

function minBills(k, d) {
  const M = new Array(k + 1).fill(Infinity);
  M[0] = 0;
  for (let t = 1; t <= k; t++)
    for (const x of d) if (x <= t && M[t - x] + 1 < M[t]) M[t] = M[t - x] + 1;
  return M[k];
}

function firstGreedyFailure(d, limit) {
  const M = new Array(limit + 1).fill(Infinity);
  M[0] = 0;
  for (let t = 1; t <= limit; t++) {
    for (const x of d) if (x <= t && M[t - x] + 1 < M[t]) M[t] = M[t - x] + 1;
    if (greedyChange(t, d) > M[t]) return t;
  }
  return null;
}
`;

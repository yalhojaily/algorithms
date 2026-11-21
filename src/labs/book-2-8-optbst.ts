// Starter and model-solution code for the lab in book section 2.8.

export const starter = `// The cost of an optimal binary search tree, by plain backtracking (no tables yet!).
// f[0 .. n-1] are the search frequencies of the keys in sorted order.
// Cost = sum over keys of f[i] × (number of ancestors of key i, counting itself).

// 1) OptCost(i, k) for the keys i .. k (inclusive, 0-based). Return optCost(f) = OptCost(0, n − 1).
function optCost(f) {
  // your code here
}

// 2) The cost of a given tree, to check yourself. A tree is null or { key, left, right },
//    where key is an index into f.
function treeCost(tree, f) {
  // your code here
}
`;

export const solution = `function optCost(f) {
  const go = (i, k) => {
    if (i > k) return 0;
    let total = 0;
    for (let t = i; t <= k; t++) total += f[t];
    let best = Infinity;
    for (let r = i; r <= k; r++) best = Math.min(best, go(i, r - 1) + go(r + 1, k));
    return total + best;
  };
  return go(0, f.length - 1);
}

function treeCost(tree, f) {
  const go = (t, depth) => (t ? f[t.key] * depth + go(t.left, depth + 1) + go(t.right, depth + 1) : 0);
  return go(tree, 1);
}
`;

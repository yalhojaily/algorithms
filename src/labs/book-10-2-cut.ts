// Starter and model-solution code for the lab in book section 10.2.

export const starter = `// A flow network: vertices 0 … n−1, s = 0, t = n − 1, edges [u, v, c].

// 1) The capacity of the cut (S, T), where inS[v] says whether v ∈ S:
//    the sum of c over edges from S to T only.
function cutCapacity(edges, inS) {
  // your code here
}

// 2) The minimum cut capacity by brute force over all 2^(n−2) cuts (small n only).
function minCutBrute(n, edges) {
  // your code here
}
`;

export const solution = `function cutCapacity(edges, inS) {
  let total = 0;
  for (const [u, v, c] of edges) if (inS[u] && !inS[v]) total += c;   // T → S edges don't count
  return total;
}

function minCutBrute(n, edges) {
  let best = Infinity;
  for (let mask = 0; mask < 1 << (n - 2); mask++) {
    const inS = new Array(n).fill(false);
    inS[0] = true;
    for (let v = 1; v < n - 1; v++) if ((mask >> (v - 1)) & 1) inS[v] = true;
    best = Math.min(best, cutCapacity(edges, inS));
  }
  return best;
}
`;

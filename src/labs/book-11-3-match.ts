// Starter and model-solution code for the lab in book section 11.3.

export const starter = `// A bipartite graph: left vertices 0 … nL−1, right vertices 0 … nR−1, edges [i, j] (left i, right j).
// Return a maximum matching as an array of edges [i, j]. Use alternating (augmenting) paths.

function maxMatching(nL, nR, edges) {
  // your code here
}
`;

export const solution = `function maxMatching(nL, nR, edges) {
  const adj = Array.from({ length: nL }, () => []);
  for (const [i, j] of edges) adj[i].push(j);
  const mateR = new Array(nR).fill(-1);
  // try to find an alternating path from left vertex i to an unmatched right vertex
  const augment = (i, seen) => {
    for (const j of adj[i]) {
      if (seen[j]) continue;
      seen[j] = true;
      if (mateR[j] < 0 || augment(mateR[j], seen)) { mateR[j] = i; return true; }
    }
    return false;
  };
  for (let i = 0; i < nL; i++) augment(i, new Array(nR).fill(false));
  const M = [];
  mateR.forEach((i, j) => { if (i >= 0) M.push([i, j]); });
  return M;
}
`;

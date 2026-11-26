// Starter and model-solution code for the lab in book section 12.12.

export const starter = `// VertexCover → SubsetSum. A graph with vertices 0 … n−1 and edges [u, v] (numbered 0 … E−1 in this order), and k.
// Return { X, T }: X lists b_i = 4^i for every edge i, then a_v = 4^E + Σ 4^i over the edges i at v, for every vertex v;
// T = k·4^E + Σ_i 2·4^i. Some subset of X sums to T if and only if the graph has a vertex cover of size k.

function vcToSubsetSum(n, edges, k) {
  // your code here
}
`;

export const solution = `function vcToSubsetSum(n, edges, k) {
  const E = edges.length, X = [];
  for (let i = 0; i < E; i++) X.push(4 ** i);
  for (let v = 0; v < n; v++) {
    let a = 4 ** E;
    edges.forEach(([p, q], i) => { if (p === v || q === v) a += 4 ** i; });
    X.push(a);
  }
  let T = k * 4 ** E;
  for (let i = 0; i < E; i++) T += 2 * 4 ** i;
  return { X, T };
}
`;

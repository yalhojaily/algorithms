// Starter and model-solution code for the lab in book section 9.5.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w], no negative cycles.

// AllPairsBellmanFord (Shimbel): start with dist[u][u] = 0 and ∞ elsewhere; then V − 1 times,
// for every source u and every edge x → v, relax dist[u][v] with dist[u][x] + w(x → v).
function allPairsBellmanFord(n, edges) {
  // your code here
}
`;

export const solution = `function allPairsBellmanFord(n, edges) {
  const dist = Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => (u === v ? 0 : Infinity)));
  for (let l = 1; l < n; l++)
    for (let u = 0; u < n; u++)
      for (const [x, v, w] of edges)
        if (dist[u][x] + w < dist[u][v]) dist[u][v] = dist[u][x] + w;
  return dist;
}
`;

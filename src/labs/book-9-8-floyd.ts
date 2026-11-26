// Starter and model-solution code for the lab in book section 9.8.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w], no negative cycles.

// Floyd–Warshall with predecessors: return { dist, pred }, where pred[u][v] is the
// second-to-last vertex on a shortest path from u to v (-1 if none or u === v). O(V³).
function floydWarshall(n, edges) {
  // your code here
}
`;

export const solution = `function floydWarshall(n, edges) {
  const dist = Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => (u === v ? 0 : Infinity)));
  const pred = Array.from({ length: n }, () => new Array(n).fill(-1));
  for (const [u, v, w] of edges) if (u !== v && w < dist[u][v]) { dist[u][v] = w; pred[u][v] = u; }
  for (let r = 0; r < n; r++)
    for (let u = 0; u < n; u++)
      for (let v = 0; v < n; v++)
        if (dist[u][r] + dist[r][v] < dist[u][v]) {
          dist[u][v] = dist[u][r] + dist[r][v];
          pred[u][v] = pred[r][v];                  // the last step comes from the r → v part
        }
  return { dist, pred };
}
`;

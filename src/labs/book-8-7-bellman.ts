// Starter and model-solution code for the lab in book section 8.7.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w] (weights may be negative).

// Bellman-Ford: V − 1 rounds of relaxing every tense edge, then one more check.
// Return the distances from s (Infinity if unreachable), or null if a negative cycle
// is reachable from s.
function bellmanFord(n, edges, s) {
  // your code here
}
`;

export const solution = `function bellmanFord(n, edges, s) {
  const dist = new Array(n).fill(Infinity);
  dist[s] = 0;
  for (let i = 1; i < n; i++) {
    let changed = false;
    for (const [u, v, w] of edges)
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
    if (!changed) break;                         // nothing tense: already done
  }
  for (const [u, v, w] of edges) if (dist[u] + w < dist[v]) return null;   // still tense
  return dist;
}
`;

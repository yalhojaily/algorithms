// Starter and model-solution code for the lab in book section 8.5.

export const starter = `// A dag: vertices 0 … n−1, edges [u, v, w] (weights may be negative).

// Shortest-path distances from s to every vertex (Infinity if unreachable), in O(V + E):
// topologically sort, then relax the outgoing edges of each vertex in that order (PushDagSSSP).
function dagShortest(n, edges, s) {
  // your code here
}
`;

export const solution = `function dagShortest(n, edges, s) {
  const out = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) out[u].push([v, w]);
  // topological order = reverse postorder
  const seen = new Array(n).fill(false), post = [];
  function dfs(v) {
    seen[v] = true;
    for (const [w] of out[v]) if (!seen[w]) dfs(w);
    post.push(v);
  }
  for (let v = 0; v < n; v++) if (!seen[v]) dfs(v);
  const dist = new Array(n).fill(Infinity);
  dist[s] = 0;
  for (let i = n - 1; i >= 0; i--) {
    const u = post[i];
    for (const [v, w] of out[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
  return dist;
}
`;

// Starter and model-solution code for the lab in book section 9.4.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w] (weights may be negative).

// Johnson's algorithm: return the V × V distance array, or null if there is a negative cycle.
//  1. Prices: Bellman–Ford from an artificial source with 0-weight edges to every vertex.
//  2. Reweight: w'(u → v) = pi[u] + w - pi[v]   (all ≥ 0).
//  3. Dijkstra from every vertex with w' (a simple O(V²) array version is fine here).
//  4. Undo: dist[u][v] = dist'[u][v] - pi[u] + pi[v].
function johnson(n, edges) {
  // your code here
}
`;

export const solution = `function johnson(n, edges) {
  // 1. prices (the artificial source = start every pi at 0)
  const pi = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (const [u, v, w] of edges) if (pi[u] + w < pi[v]) pi[v] = pi[u] + w;
  for (const [u, v, w] of edges) if (pi[u] + w < pi[v]) return null;      // negative cycle
  // 2. reweight
  const out = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) out[u].push([v, pi[u] + w - pi[v]]);
  // 3 + 4. Dijkstra from every source, then undo the prices
  return out.map((_, s) => {
    const d = new Array(n).fill(Infinity), done = new Array(n).fill(false);
    d[s] = 0;
    for (;;) {
      let u = -1;
      for (let x = 0; x < n; x++) if (!done[x] && d[x] < Infinity && (u < 0 || d[x] < d[u])) u = x;
      if (u < 0) break;
      done[u] = true;
      for (const [v, w] of out[u]) if (d[u] + w < d[v]) d[v] = d[u] + w;
    }
    return d.map((x, v) => (x === Infinity ? Infinity : x - pi[s] + pi[v]));
  });
}
`;

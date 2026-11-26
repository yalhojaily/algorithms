// Starter and model-solution code for the lab in book section 6.4.

export const starter = `// A dag with vertices 0 … n−1 and weighted edges [u, v, length].

// 1) The length of the longest path from s to t (−Infinity if t is unreachable from s).
function longestPath(n, edges, s, t) {
  // your code here
}

// 2) The length of the shortest path from s to t (Infinity if unreachable).
//    Lengths may be negative: that is fine in a dag.
function shortestPath(n, edges, s, t) {
  // your code here
}
`;

export const solution = `function postorder(n, adj) {
  const seen = new Array(n).fill(false), out = [];
  function dfs(v) {
    seen[v] = true;
    for (const [w] of adj[v]) if (!seen[w]) dfs(w);
    out.push(v);
  }
  for (let v = 0; v < n; v++) if (!seen[v]) dfs(v);
  return out;
}

function bestPath(n, edges, s, t, better, none) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, len] of edges) adj[u].push([v, len]);
  const val = new Array(n);
  for (const v of postorder(n, adj)) {             // every successor is finished first
    if (v === t) { val[v] = 0; continue; }
    val[v] = none;
    for (const [w, len] of adj[v]) val[v] = better(val[v], len + val[w]);
  }
  return val[s];
}

function longestPath(n, edges, s, t) {
  return bestPath(n, edges, s, t, Math.max, -Infinity);
}

function shortestPath(n, edges, s, t) {
  return bestPath(n, edges, s, t, Math.min, Infinity);
}
`;

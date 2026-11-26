// Starter and model-solution code for the lab in book section 8.1.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w].
// You are given the correct shortest-path distances dist[] from s (Infinity if unreachable).

// 1) Build a shortest-path tree: return pred[], with pred[s] = -1, pred[v] = -1 if v is unreachable,
//    and otherwise pred[v] = some u with an edge u → v and dist[u] + w(u → v) === dist[v].
//    (Assume all weights are positive.)
function treeFromDistances(n, edges, s, dist) {
  // your code here
}

// 2) Follow pred[] back from v: return the path [s, …, v], or null if v is unreachable.
function pathTo(pred, s, v) {
  // your code here
}
`;

export const solution = `function treeFromDistances(n, edges, s, dist) {
  const pred = new Array(n).fill(-1);
  for (const [u, v, w] of edges)
    if (v !== s && pred[v] < 0 && dist[u] < Infinity && dist[u] + w === dist[v]) pred[v] = u;   // careful: ∞ + w === ∞
  return pred;
}

function pathTo(pred, s, v) {
  if (v !== s && pred[v] < 0) return null;
  const path = [v];
  while (v !== s) { v = pred[v]; path.push(v); }
  return path.reverse();
}
`;

// Starter and model-solution code for the lab in book section 9.3.

export const starter = `// Edges [u, v, w]; a price pi[v] for every vertex.

// 1) The reweighted edges: [u, v, pi[u] + w - pi[v]] for every edge (a new array).
function reweight(edges, pi) {
  // your code here
}

// 2) The length of a path (an array of vertices) under a weight lookup w(u, v).
//    Then check: for a path from a to b, newLength − oldLength === pi[a] − pi[b].
function pathLength(path, w) {
  // your code here
}
`;

export const solution = `function reweight(edges, pi) {
  return edges.map(([u, v, w]) => [u, v, pi[u] + w - pi[v]]);
}

function pathLength(path, w) {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += w(path[i - 1], path[i]);
  return total;
}
`;

// Starter and model-solution code for the lab in book section 7.1.

export const starter = `// An edge is [u, v, w]: endpoints u, v (an undirected edge) and weight w.

// 1) Erickson's ShorterEdge as a comparator: negative if edge a is "shorter" than edge b,
//    positive if b is shorter. Compare weights; break ties by min(u, v), then by max(u, v).
//    ([u, v] and [v, u] are the same edge.)
function compareEdges(a, b) {
  // your code here
}

// 2) Return a new array of the edges sorted by compareEdges (do not change the input).
function sortEdges(edges) {
  // your code here
}
`;

export const solution = `function compareEdges(a, b) {
  const [i, j, wa] = a, [k, l, wb] = b;
  if (wa !== wb) return wa - wb;
  if (Math.min(i, j) !== Math.min(k, l)) return Math.min(i, j) - Math.min(k, l);
  return Math.max(i, j) - Math.max(k, l);
}

function sortEdges(edges) {
  return edges.slice().sort(compareEdges);
}
`;

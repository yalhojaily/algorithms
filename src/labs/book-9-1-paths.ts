// Starter and model-solution code for the lab in book section 9.1.

export const starter = `// pred[u][v] is the second-to-last vertex on a shortest path from u to v
// (-1 if u === v or v is unreachable from u).

// Return the shortest path from u to v as an array [u, …, v], [u] if u === v,
// or null if v is unreachable.
function apspPath(pred, u, v) {
  // your code here
}
`;

export const solution = `function apspPath(pred, u, v) {
  if (u === v) return [u];
  if (pred[u][v] < 0) return null;
  const path = [v];
  while (v !== u) { v = pred[u][v]; path.push(v); }   // always the row of the source u
  return path.reverse();
}
`;

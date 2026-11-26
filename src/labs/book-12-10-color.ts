// Starter and model-solution code for the lab in book section 12.10.

export const starter = `// 3SAT → 3Color. clauses: arrays of three nonzero integers (+v / −v), variables 1 … nVars.
// Build the graph of Section 12.10 and return { n, edges }:
//   vertices 0, 1, 2 are T, F, X (a triangle);
//   for each variable v: two vertices (v and ¬v) forming a triangle with X;
//   for each clause: the five-node gadget joining its three literal vertices to T.
// The graph must be 3-colorable if and only if the formula is satisfiable.

function satTo3Color(nVars, clauses) {
  // your code here
}
`;

export const solution = `function satTo3Color(nVars, clauses) {
  const T = 0, F = 1, X = 2, edges = [[T, F], [F, X], [X, T]];
  const pos = (v) => 3 + 2 * (v - 1), neg = (v) => 4 + 2 * (v - 1);
  for (let v = 1; v <= nVars; v++) edges.push([pos(v), neg(v)], [pos(v), X], [neg(v), X]);
  let n = 3 + 2 * nVars;
  const lit = (l) => (l > 0 ? pos(l) : neg(-l));
  for (const [a, b, c] of clauses) {
    const p = n, q = n + 1, r = n + 2, s = n + 3, t = n + 4;
    n += 5;
    // first triangle: a majority gate on a and b, output r
    edges.push([lit(a), p], [lit(b), q], [p, q], [p, r], [q, r]);
    // second triangle closes on T itself: s and t must avoid r's and c's colors and T's color
    edges.push([r, s], [lit(c), t], [s, t], [s, T], [t, T]);
  }
  return { n, edges };
}
`;

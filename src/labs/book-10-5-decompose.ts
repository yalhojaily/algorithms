// Starter and model-solution code for the lab in book section 10.5.

export const starter = `// A flow network: vertices 0 … n−1, s = 0, t = n − 1, edges [u, v, c],
// and a feasible non-negative flow f.

// Decompose f into paths and cycles: return an array of pieces { edges, amount },
// where edges is a list of edge indices forming an s → t path or a directed cycle, amount > 0,
// and adding amount along every piece rebuilds f exactly. At most E pieces.
function decompose(n, edges, f) {
  // your code here
}
`;

export const solution = `function decompose(n, edges, f) {
  f = f.slice();
  const pieces = [], s = 0, t = n - 1;
  const outEdge = (u) => edges.findIndex(([a], k) => a === u && f[k] > 0);
  for (;;) {
    let start = outEdge(s) >= 0 ? s : -1;
    for (let v = 0; v < n && start < 0; v++) if (outEdge(v) >= 0) start = v;
    if (start < 0) return pieces;                  // the flow is empty
    const verts = [start], es = [];
    for (;;) {                                     // walk along positive flow
      const x = verts[verts.length - 1];
      if (x === t && start === s) break;           // an s → t path
      const k = outEdge(x), y = edges[k][1];
      es.push(k);
      const j = verts.indexOf(y);
      if (j >= 0) { es.splice(0, j); break; }      // a cycle: keep only its edges
      verts.push(y);
    }
    const amount = Math.min(...es.map((k) => f[k]));
    for (const k of es) f[k] -= amount;            // at least one edge becomes empty
    pieces.push({ edges: es, amount });
  }
}
`;

// Starter and model-solution code for the lab in book section 10.3.

export const starter = `// A reduced flow network: vertices 0 … n−1, s = 0, t = n − 1, edges [u, v, c],
// never both u → v and v → u. A feasible flow f (f[k] on edge k).

// 1) The residual graph: every arc [x, y, r] with r > 0, where
//    an edge u → v contributes [u, v, c − f] and [v, u, f] (only those with positive r).
function residual(edges, f) {
  // your code here
}

// 2) The set S of vertices reachable from s in the residual graph, as a sorted array.
//    (If t is not in S, then f is a maximum flow and (S, V \\ S) is a minimum cut.)
function residualReach(n, edges, f) {
  // your code here
}
`;

export const solution = `function residual(edges, f) {
  const out = [];
  edges.forEach(([u, v, c], k) => {
    if (c - f[k] > 0) out.push([u, v, c - f[k]]);   // room to push more
    if (f[k] > 0) out.push([v, u, f[k]]);            // room to push back (cancel)
  });
  return out;
}

function residualReach(n, edges, f) {
  const R = residual(edges, f), seen = new Array(n).fill(false), stack = [0];
  seen[0] = true;
  while (stack.length) {
    const x = stack.pop();
    for (const [a, b] of R) if (a === x && !seen[b]) { seen[b] = true; stack.push(b); }
  }
  return seen.map((s, v) => (s ? v : -1)).filter((v) => v >= 0);
}
`;

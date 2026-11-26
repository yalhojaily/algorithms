// Starter and model-solution code for the lab in book section 11.1.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v]. Find as many EDGE-disjoint paths from s to t as possible.
// Return an array of paths, each a list of vertices [s, …, t]. No edge may be used by two paths.

function edgeDisjointPaths(n, edges, s, t) {
  // your code here: unit capacities, Ford–Fulkerson, then follow the saturated edges
}
`;

export const solution = `function edgeDisjointPaths(n, edges, s, t) {
  const f = edges.map(() => 0);
  for (;;) {                                            // Ford–Fulkerson with depth-first search
    const via = new Array(n).fill(null), seen = new Array(n).fill(false), stack = [s];
    seen[s] = true;
    while (stack.length) {
      const u = stack.pop();
      edges.forEach(([a, b], k) => {
        if (a === u && !seen[b] && f[k] === 0) { seen[b] = true; via[b] = [k, 1, u]; stack.push(b); }
        if (b === u && !seen[a] && f[k] === 1) { seen[a] = true; via[a] = [k, -1, u]; stack.push(a); }
      });
    }
    if (!seen[t]) break;
    for (let x = t; x !== s; x = via[x][2]) f[via[x][0]] += via[x][1];
  }
  const paths = [];                                     // follow saturated edges from s
  for (;;) {
    const p = [s], used = [];
    while (p[p.length - 1] !== t) {
      const x = p[p.length - 1], k = edges.findIndex(([a], j) => a === x && f[j] === 1);
      if (k < 0) return paths;
      const j = p.indexOf(edges[k][1]);
      if (j >= 0) { for (const e of used.splice(j)) f[e] = 0; f[k] = 0; p.length = j + 1; continue; }   // drop a cycle
      p.push(edges[k][1]); used.push(k);
    }
    for (const e of used) f[e] = 0;
    paths.push(p);
  }
}
`;

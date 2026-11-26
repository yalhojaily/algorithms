// Starter and model-solution code for the lab in book section 11.2.

export const starter = `// A directed graph with no edge s→t. Find as many VERTEX-disjoint paths from s to t as possible:
// no vertex other than s and t may lie on two paths. Return the paths as vertex lists.
// Idea: split each vertex v into v_in = 2v and v_out = 2v + 1, with an edge v_in → v_out of capacity 1.

function vertexDisjointPaths(n, edges, s, t) {
  // your code here
}
`;

export const solution = `function vertexDisjointPaths(n, edges, s, t) {
  const E = [];
  for (let v = 0; v < n; v++) E.push([2 * v, 2 * v + 1, v === s || v === t ? n : 1]);
  for (const [u, v] of edges) if (v !== s && u !== t) E.push([2 * u + 1, 2 * v, 1]);
  const N = 2 * n, f = E.map(() => 0), src = 2 * s + 1, snk = 2 * t;
  for (;;) {
    const via = new Array(N).fill(null), seen = new Array(N).fill(false), q = [src];
    seen[src] = true;
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      E.forEach(([a, b, c], k) => {
        if (a === u && !seen[b] && f[k] < c) { seen[b] = true; via[b] = [k, 1, u]; q.push(b); }
        if (b === u && !seen[a] && f[k] > 0) { seen[a] = true; via[a] = [k, -1, u]; q.push(a); }
      });
    }
    if (!seen[snk]) break;
    for (let x = snk; x !== src; x = via[x][2]) f[via[x][0]] += via[x][1];
  }
  const paths = [];
  for (;;) {                                        // walk saturated edges; every inner vertex carries ≤ 1 unit
    const p = [s];
    let x = src;
    while (x !== snk) {
      const k = E.findIndex(([a], j) => a === x && f[j] > 0);
      if (k < 0) return paths;
      f[k]--; x = E[k][1];
      if (x % 2 === 0) p.push(x / 2);
    }
    paths.push(p);
  }
}
`;

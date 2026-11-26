// Starter and model-solution code for the lab in book section 10.4.

export const starter = `// A reduced flow network: vertices 0 … n−1, s = 0, t = n − 1, edges [u, v, c] with integer c.

// Ford–Fulkerson: start with f = 0; while the residual graph has an s → t path
// (find any one, e.g. by depth-first search), push its bottleneck along it.
// Return { value, flow } where flow[k] is the flow on edge k.
function maxFlow(n, edges) {
  // your code here
}
`;

export const solution = `function maxFlow(n, edges) {
  const flow = new Array(edges.length).fill(0), s = 0, t = n - 1;
  let value = 0;
  for (;;) {
    // residual arcs: [to, edge index, +1 forward / -1 backward, residual capacity]
    const out = Array.from({ length: n }, () => []);
    edges.forEach(([u, v, c], k) => {
      if (c - flow[k] > 0) out[u].push([v, k, 1, c - flow[k]]);
      if (flow[k] > 0) out[v].push([u, k, -1, flow[k]]);
    });
    const via = new Array(n).fill(null), seen = new Array(n).fill(false), stack = [s];
    seen[s] = true;
    while (stack.length) {                         // whatever-first search
      const x = stack.pop();
      for (const a of out[x]) if (!seen[a[0]]) { seen[a[0]] = true; via[a[0]] = [x, a]; stack.push(a[0]); }
    }
    if (!seen[t]) return { value, flow };          // no augmenting path: maximum
    let F = Infinity;
    for (let x = t; x !== s; x = via[x][0]) F = Math.min(F, via[x][1][3]);
    for (let x = t; x !== s; x = via[x][0]) { const [, k, dir] = via[x][1]; flow[k] += dir * F; }
    value += F;
  }
}
`;

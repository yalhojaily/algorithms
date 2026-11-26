// Starter and model-solution code for the lab in book section 10.6.

export const starter = `// A reduced flow network: vertices 0 … n−1, s = 0, t = n − 1, edges [u, v, c].

// Edmonds–Karp: Ford–Fulkerson where every augmenting path is a SHORTEST one (breadth-first search).
// Return { value, iterations }.
function edmondsKarp(n, edges) {
  // your code here
}
`;

export const solution = `function edmondsKarp(n, edges) {
  const flow = new Array(edges.length).fill(0), s = 0, t = n - 1;
  let value = 0, iterations = 0;
  for (;;) {
    const out = Array.from({ length: n }, () => []);
    edges.forEach(([u, v, c], k) => {
      if (c - flow[k] > 0) out[u].push([v, k, 1, c - flow[k]]);
      if (flow[k] > 0) out[v].push([u, k, -1, flow[k]]);
    });
    const via = new Array(n).fill(null), queue = [s], seen = new Array(n).fill(false);
    seen[s] = true;
    for (let h = 0; h < queue.length; h++)         // breadth-first search
      for (const a of out[queue[h]]) if (!seen[a[0]]) { seen[a[0]] = true; via[a[0]] = [queue[h], a]; queue.push(a[0]); }
    if (!seen[t]) return { value, iterations };
    let F = Infinity;
    for (let x = t; x !== s; x = via[x][0]) F = Math.min(F, via[x][1][3]);
    for (let x = t; x !== s; x = via[x][0]) { const [, k, dir] = via[x][1]; flow[k] += dir * F; }
    value += F; iterations++;
  }
}
`;

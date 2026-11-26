// Starter and model-solution code for the lab in book section 8.3.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w] (weights may be negative).

// Ford's generic algorithm: InitSSSP(s), then repeatedly relax ANY tense edge until none is tense.
// Return { dist, pred }. If more than maxRelax relaxations happen, give up and return null
// (that is how we notice a negative cycle here).
function ford(n, edges, s, maxRelax) {
  // your code here
}
`;

export const solution = `function ford(n, edges, s, maxRelax) {
  const dist = new Array(n).fill(Infinity), pred = new Array(n).fill(-1);
  dist[s] = 0;
  let count = 0;
  for (;;) {
    const tense = edges.filter(([u, v, w]) => dist[u] + w < dist[v]);
    if (tense.length === 0) return { dist, pred };
    const [u, v, w] = tense[Math.floor(Math.random() * tense.length)];   // any tense edge
    dist[v] = dist[u] + w; pred[v] = u;                                   // Relax(u → v)
    if (++count > maxRelax) return null;
  }
}
`;

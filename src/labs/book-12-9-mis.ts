// Starter and model-solution code for the lab in book section 12.9.

export const starter = `// An undirected graph: vertices 0 … n−1, edges [u, v].
// maxIndependentSet: a largest independent set (array of vertices). Exponential time is expected!
// Then the two easy reductions of Section 12.9:
// maxClique: a largest clique, using maxIndependentSet on the complement graph.
// minVertexCover: a smallest vertex cover, using maxIndependentSet on the same graph.

function maxIndependentSet(n, edges) {
  // your code here: branch on a vertex — take it (and drop its neighbors), or leave it
}

function maxClique(n, edges) {
  // your code here
}

function minVertexCover(n, edges) {
  // your code here
}
`;

export const solution = `function maxIndependentSet(n, edges) {
  const adj = Array.from({ length: n }, () => new Set());
  for (const [u, v] of edges) { adj[u].add(v); adj[v].add(u); }
  let best = [];
  const go = (alive, chosen) => {
    if (chosen.length + alive.length <= best.length) return;      // cannot beat the best
    if (alive.length === 0) { best = chosen; return; }
    // vertex of largest degree among the alive ones
    let v = alive[0], dv = -1;
    for (const u of alive) { let d = 0; for (const w of alive) if (adj[u].has(w)) d++; if (d > dv) { dv = d; v = u; } }
    if (dv === 0) { best = chosen.concat(alive); return; }       // no edges left: take everything
    go(alive.filter((u) => u !== v && !adj[v].has(u)), chosen.concat([v]));   // take v
    go(alive.filter((u) => u !== v), chosen);                                 // leave v
  };
  go([...Array(n).keys()], []);
  return best;
}

function maxClique(n, edges) {
  const has = new Set(edges.map(([u, v]) => u * n + v).concat(edges.map(([u, v]) => v * n + u)));
  const comp = [];
  for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (!has.has(u * n + v)) comp.push([u, v]);
  return maxIndependentSet(n, comp);
}

function minVertexCover(n, edges) {
  const I = new Set(maxIndependentSet(n, edges));
  return [...Array(n).keys()].filter((v) => !I.has(v));
}
`;

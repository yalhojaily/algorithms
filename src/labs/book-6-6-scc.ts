// Starter and model-solution code for the lab in book section 6.6.

export const starter = `// adj[v] is the array of out-neighbours of v; vertices are 0 … n−1.

// Label the strong components in O(V + E): return an array comp, where comp[u] === comp[v]
// exactly when u and v are in the same strong component (any labels you like).
// Kosaraju–Sharir or Tarjan, your choice.
function strongComponents(adj) {
  // your code here
}
`;

export const solution = `// Kosaraju–Sharir: postorder of rev(G), then label in G in reverse of that order.
function strongComponents(adj) {
  const n = adj.length, rev = adj.map(() => []);
  adj.forEach((l, u) => { for (const v of l) rev[v].push(u); });
  const marked = new Array(n).fill(false), S = [];
  function pushPost(v) {
    marked[v] = true;
    for (const u of rev[v]) if (!marked[u]) pushPost(u);
    S.push(v);
  }
  for (let v = 0; v < n; v++) if (!marked[v]) pushPost(v);
  const root = new Array(n).fill(-1);
  function label(v, r) {
    root[v] = r;
    for (const w of adj[v]) if (root[w] < 0) label(w, r);
  }
  while (S.length) { const v = S.pop(); if (root[v] < 0) label(v, v); }
  return root;
}
`;

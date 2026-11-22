// Starter and model-solution code for the lab in book section 5.5.

export const starter = `// adj is an adjacency list: adj[v] is the array of neighbours of v.

// WhateverFirstSearch with a stack as the bag, storing pairs (parent, vertex).
// Return the parent array: parent[s] = -1, parent[v] = -2 for vertices not reachable from s,
// and otherwise the vertex that put v into the bag when v was marked.
function whateverFirst(adj, s) {
  // your code here
}
`;

export const solution = `function whateverFirst(adj, s) {
  const parent = new Array(adj.length).fill(-2);
  const marked = new Array(adj.length).fill(false);
  const bag = [[-1, s]];
  while (bag.length) {
    const [p, v] = bag.pop();
    if (marked[v]) continue;
    marked[v] = true;
    parent[v] = p;
    for (const w of adj[v]) bag.push([v, w]);
  }
  return parent;
}
`;

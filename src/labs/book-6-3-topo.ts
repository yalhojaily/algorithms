// Starter and model-solution code for the lab in book section 6.3.

export const starter = `// adj[v] is the array of out-neighbours of v; vertices are 0 … n−1.

// A topological ordering: an array of all vertices such that every edge u → v
// has u before v. Return null if the graph has a directed cycle.
function topoSort(adj) {
  // your code here
}
`;

export const solution = `function topoSort(adj) {
  const n = adj.length, NEW = 0, ACTIVE = 1, DONE = 2;
  const status = new Array(n).fill(NEW), S = new Array(n);
  let clock = n, ok = true;
  function dfs(v) {
    status[v] = ACTIVE;
    for (const w of adj[v]) {
      if (status[w] === NEW) dfs(w);
      else if (status[w] === ACTIVE) ok = false;   // fail gracefully
    }
    status[v] = DONE;
    S[--clock] = v;                                // reverse postorder
  }
  for (let v = 0; v < n; v++) if (status[v] === NEW) dfs(v);
  return ok ? S : null;
}
`;

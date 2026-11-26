// Starter and model-solution code for the lab in book section 6.1.

export const starter = `// adj[v] is the array of out-neighbours of v; vertices are 0 … n−1.
// Run DFSAll: try roots in order 0, 1, 2, …, and edges in list order.

// 1) Starting and finishing times: return { pre, post }, two arrays, the clock starting at 0
//    and increasing by one at every start and every finish (so the times are 1 … 2n).
function prePost(adj) {
  // your code here
}

// 2) Classify every edge: return cls, where cls[v][i] is 'tree', 'forward', 'back' or 'cross'
//    for the edge v → adj[v][i].
function classify(adj) {
  // your code here
}
`;

export const solution = `function prePost(adj) {
  const n = adj.length, pre = new Array(n).fill(0), post = new Array(n).fill(0);
  let clock = 0;
  function dfs(v) {
    pre[v] = ++clock;
    for (const w of adj[v]) if (!pre[w]) dfs(w);
    post[v] = ++clock;
  }
  for (let v = 0; v < n; v++) if (!pre[v]) dfs(v);
  return { pre, post };
}

function classify(adj) {
  const n = adj.length, pre = new Array(n).fill(0), post = new Array(n).fill(0);
  const cls = adj.map((l) => new Array(l.length));
  let clock = 0;
  function dfs(v) {
    pre[v] = ++clock;
    adj[v].forEach((w, i) => {
      if (!pre[w]) { cls[v][i] = 'tree'; dfs(w); }
      else if (!post[w]) cls[v][i] = 'back';            // w is still active
      else cls[v][i] = pre[v] < pre[w] ? 'forward' : 'cross';
    });
    post[v] = ++clock;
  }
  for (let v = 0; v < n; v++) if (!pre[v]) dfs(v);
  return cls;
}
`;

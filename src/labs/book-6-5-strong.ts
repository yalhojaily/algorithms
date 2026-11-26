// Starter and model-solution code for the lab in book section 6.5.

export const starter = `// adj[v] is the array of out-neighbours of v; vertices are 0 … n−1.

// 1) The strong component of v: all u with v → … → u and u → … → v,
//    as an array sorted in increasing order. Linear time.
function strongComponentOf(adj, v) {
  // your code here
}

// 2) Is the whole graph strongly connected? Linear time.
function isStronglyConnected(adj) {
  // your code here
}
`;

export const solution = `function reachFrom(adj, s) {
  const seen = new Array(adj.length).fill(false), stack = [s];
  while (stack.length) {
    const v = stack.pop();
    if (seen[v]) continue;
    seen[v] = true;
    for (const w of adj[v]) if (!seen[w]) stack.push(w);
  }
  return seen;
}

function reversal(adj) {
  const rev = adj.map(() => []);
  adj.forEach((l, u) => { for (const v of l) rev[v].push(u); });
  return rev;
}

function strongComponentOf(adj, v) {
  const fw = reachFrom(adj, v), bw = reachFrom(reversal(adj), v), out = [];
  for (let u = 0; u < adj.length; u++) if (fw[u] && bw[u]) out.push(u);
  return out;
}

function isStronglyConnected(adj) {
  return strongComponentOf(adj, 0).length === adj.length;
}
`;

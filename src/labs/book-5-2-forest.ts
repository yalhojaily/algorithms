// Starter and model-solution code for the lab in book section 5.2.

export const starter = `// A graph with vertices 0 … n−1 and a list of undirected edges [u, v].

// 1) The degree of every vertex, as an array.
function degrees(n, edges) {
  // your code here
}

// 2) The number of components.
function countComponents(n, edges) {
  // your code here
}

// 3) Is the graph a tree? (connected and acyclic)
function isTree(n, edges) {
  // your code here
}
`;

export const solution = `function degrees(n, edges) {
  const d = new Array(n).fill(0);
  for (const [u, v] of edges) { d[u]++; d[v]++; }
  return d;
}

function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const seen = new Array(n).fill(false);
  let count = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    count++;
    const stack = [s];
    while (stack.length) {
      const v = stack.pop();
      if (seen[v]) continue;
      seen[v] = true;
      for (const w of adj[v]) stack.push(w);
    }
  }
  return count;
}

function isTree(n, edges) {
  // connected, and exactly n − 1 edges (a forest with c components has n − c edges)
  return edges.length === n - 1 && countComponents(n, edges) === 1;
}
`;

// Starter and model-solution code for the lab in lesson 0.11.

export const starter = `// A graph has vertices 0, 1, …, n−1 and an array of edges [[u, v], ...].
// Edges are undirected; the same pair may appear twice (a multigraph, like Königsberg).
// Tip: build adjacency lists first:
//   const adj = Array.from({ length: n }, () => []);
//   for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }

// 1) The degree of every vertex, as an array of length n.
function degrees(n, edges) {
  // your code here
}

// 2) The number of connected components.
//    Careful: a recursive DFS may overflow the call stack on a path with 10⁵ vertices.
//    Use an explicit stack (or a queue).
function components(n, edges) {
  // your code here
}

// 3) Is the graph a tree? (connected, and exactly n − 1 edges)
function isTree(n, edges) {
  // your code here
}

// 4) 'circuit', 'path' or 'none': does an Euler circuit / Euler path exist?
//    (Ignore isolated vertices; all edges must be in one component.)
function eulerKind(n, edges) {
  // your code here
}

// 5) Can the vertices be coloured with 2 colours so that every edge joins different colours?
function isBipartite(n, edges) {
  // your code here
}
`;

export const solution = `function adjOf(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  return adj;
}

function degrees(n, edges) {
  const d = Array(n).fill(0);
  for (const [u, v] of edges) { d[u]++; d[v]++; }
  return d;
}

function componentIds(n, edges) {
  const adj = adjOf(n, edges);
  const comp = Array(n).fill(-1);
  let c = 0;
  for (let s = 0; s < n; s++) {
    if (comp[s] >= 0) continue;
    comp[s] = c;
    const stack = [s];
    while (stack.length) {
      const u = stack.pop();
      for (const w of adj[u]) if (comp[w] < 0) { comp[w] = c; stack.push(w); }
    }
    c++;
  }
  return comp;
}

function components(n, edges) {
  return new Set(componentIds(n, edges)).size;
}

function isTree(n, edges) {
  return n > 0 && edges.length === n - 1 && components(n, edges) === 1;
}

function eulerKind(n, edges) {
  if (edges.length === 0) return 'none';
  const d = degrees(n, edges);
  const comp = componentIds(n, edges);
  const comps = new Set(d.map((x, i) => (x > 0 ? comp[i] : -1)).filter((c) => c >= 0));
  if (comps.size > 1) return 'none';
  const odd = d.filter((x) => x % 2 === 1).length;
  return odd === 0 ? 'circuit' : odd === 2 ? 'path' : 'none';
}

function isBipartite(n, edges) {
  const adj = adjOf(n, edges);
  const color = Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    if (color[s] >= 0) continue;
    color[s] = 0;
    const queue = [s];
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h];
      for (const w of adj[u]) {
        if (color[w] < 0) { color[w] = 1 - color[u]; queue.push(w); }
        else if (color[w] === color[u]) return false;
      }
    }
  }
  return true;
}
`;

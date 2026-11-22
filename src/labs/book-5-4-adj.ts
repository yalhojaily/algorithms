// Starter and model-solution code for the lab in book section 5.4.

export const starter = `// Vertices 0 … n−1 and a list of undirected edges [u, v].

// 1) The adjacency list: an array of n arrays of neighbours.
function adjacencyList(n, edges) {
  // your code here
}

// 2) The adjacency matrix: n arrays of n zeros and ones.
function adjacencyMatrix(n, edges) {
  // your code here
}

// 3) The adjacency array (Figure 5.10): { first, nbr }, where the neighbours of v,
//    in increasing order, are nbr[first[v]] … nbr[first[v + 1] − 1], and first has n + 1 entries.
function adjacencyArray(n, edges) {
  // your code here
}
`;

export const solution = `function adjacencyList(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  return adj;
}

function adjacencyMatrix(n, edges) {
  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v] of edges) { A[u][v] = 1; A[v][u] = 1; }
  return A;
}

function adjacencyArray(n, edges) {
  const adj = adjacencyList(n, edges).map((l) => l.sort((a, b) => a - b));
  const first = [0], nbr = [];
  for (const l of adj) { nbr.push(...l); first.push(nbr.length); }
  return { first, nbr };
}
`;

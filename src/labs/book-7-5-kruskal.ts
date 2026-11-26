// Starter and model-solution code for the lab in book section 7.5.

export const starter = `// A connected graph: vertices 0 … n−1, edges [u, v, w] with distinct weights.

// 1) A disjoint-set structure: return { find, union } for the elements 0 … n−1
//    (MakeSet is done for all of them at the start).
//    find(x) returns an identifier of x's set; union(x, y) merges their sets.
function makeUnionFind(n) {
  // your code here
}

// 2) Kruskal: scan the edges by increasing weight; add an edge if its endpoints are
//    in different components. Return the MST edge indices.
function kruskal(n, edges) {
  // your code here
}
`;

export const solution = `function makeUnionFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i), size = new Array(n).fill(1);
  function find(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }   // path halving
    return x;
  }
  function union(x, y) {
    x = find(x); y = find(y);
    if (x === y) return;
    if (size[x] < size[y]) [x, y] = [y, x];          // the smaller set joins the larger
    parent[y] = x; size[x] += size[y];
  }
  return { find, union };
}

function kruskal(n, edges) {
  const order = edges.map((_, k) => k).sort((a, b) => edges[a][2] - edges[b][2]);
  const { find, union } = makeUnionFind(n), F = [];
  for (const k of order) {
    const [u, v] = edges[k];
    if (find(u) !== find(v)) { union(u, v); F.push(k); }
    if (F.length === n - 1) break;
  }
  return F;
}
`;

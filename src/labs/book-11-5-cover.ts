// Starter and model-solution code for the lab in book section 11.5.

export const starter = `// A dag: vertices 0 … n−1, edges [u, v]. Cover every vertex by as few vertex-disjoint directed paths as possible.
// Return the paths as vertex lists (a single vertex is a path of length zero).

function minPathCover(n, edges) {
  // your code here: a maximum matching between "u leaves by u→v" and "v is entered by u→v"
}
`;

export const solution = `function minPathCover(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  const prev = new Array(n).fill(-1);               // prev[v] = u if the matched edge u♭v♯ is chosen
  const augment = (u, seen) => {
    for (const v of adj[u]) {
      if (seen[v]) continue;
      seen[v] = true;
      if (prev[v] < 0 || augment(prev[v], seen)) { prev[v] = u; return true; }
    }
    return false;
  };
  for (let u = 0; u < n; u++) augment(u, new Array(n).fill(false));
  const next = new Array(n).fill(-1);
  prev.forEach((u, v) => { if (u >= 0) next[u] = v; });
  const paths = [];
  for (let v = 0; v < n; v++) if (prev[v] < 0) {    // a path starts at each vertex with no matched predecessor
    const p = [v];
    while (next[p[p.length - 1]] >= 0) p.push(next[p[p.length - 1]]);
    paths.push(p);
  }
  return paths;
}
`;

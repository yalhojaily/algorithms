// Starter and model-solution code for the lab in book section 9.2.

export const starter = `// An unweighted directed graph: adj[v] is the array of out-neighbours of v.

// All-pairs shortest-path distances by V breadth-first searches, in O(VE):
// return a V × V array dist (Infinity where unreachable, 0 on the diagonal).
function allPairsBFS(adj) {
  // your code here
}
`;

export const solution = `function allPairsBFS(adj) {
  const n = adj.length;
  return adj.map((_, s) => {
    const dist = new Array(n).fill(Infinity), queue = [s];
    dist[s] = 0;
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h];
      for (const v of adj[u]) if (dist[v] === Infinity) { dist[v] = dist[u] + 1; queue.push(v); }
    }
    return dist;
  });
}
`;

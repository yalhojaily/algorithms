// Starter and model-solution code for the lab in book section 5.6.

export const starter = `// adj is an adjacency list: adj[v] is the array of neighbours of v.

// 1) Breadth-first search from s: the number of edges on a shortest path to every vertex
//    (Infinity if unreachable).
function bfsDistances(adj, s) {
  // your code here
}

// 2) CountAndLabel: return { count, comp }, where comp[v] is the number (1 … count)
//    of the component containing v, numbered in the order WFSAll finds them (scanning v = 0, 1, …).
function countAndLabel(adj) {
  // your code here
}
`;

export const solution = `function bfsDistances(adj, s) {
  const dist = new Array(adj.length).fill(Infinity);
  const queue = [[-1, s]];
  let head = 0;                      // shift() is slow; walk an index instead
  while (head < queue.length) {
    const [p, v] = queue[head++];
    if (dist[v] !== Infinity) continue;
    dist[v] = p < 0 ? 0 : dist[p] + 1;
    for (const w of adj[v]) if (dist[w] === Infinity) queue.push([v, w]);
  }
  return dist;
}

function countAndLabel(adj) {
  const comp = new Array(adj.length).fill(0);
  let count = 0;
  for (let s = 0; s < adj.length; s++) {
    if (comp[s]) continue;
    count++;
    const bag = [s];
    while (bag.length) {
      const v = bag.pop();
      if (comp[v]) continue;
      comp[v] = count;
      for (const w of adj[v]) bag.push(w);
    }
  }
  return { count, comp };
}
`;

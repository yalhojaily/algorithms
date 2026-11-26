// Starter and model-solution code for the lab in book section 6.2.

export const starter = `// adj[v] is the array of out-neighbours of v; vertices are 0 … n−1.

// 1) Is the directed graph acyclic? Use the three states new / active / finished.
function isAcyclic(adj) {
  // your code here
}

// 2) Return one directed cycle as an array of vertices [v0, v1, …, vk]
//    (each vi → v(i+1) an edge, and vk → v0 an edge), or null if there is none.
function findCycle(adj) {
  // your code here
}
`;

export const solution = `function isAcyclic(adj) {
  return findCycle(adj) === null;
}

function findCycle(adj) {
  const n = adj.length, NEW = 0, ACTIVE = 1, DONE = 2;
  const status = new Array(n).fill(NEW), parent = new Array(n).fill(-1);
  let found = null;
  function dfs(v) {
    status[v] = ACTIVE;
    for (const w of adj[v]) {
      if (found) return;
      if (status[w] === ACTIVE) {                 // back edge v → w: walk the parents from v up to w
        const cyc = [v];
        for (let x = v; x !== w; ) { x = parent[x]; cyc.push(x); }
        found = cyc.reverse();
        return;
      }
      if (status[w] === NEW) { parent[w] = v; dfs(w); }
    }
    status[v] = DONE;
  }
  for (let v = 0; v < n && !found; v++) if (status[v] === NEW) dfs(v);
  return found;
}
`;

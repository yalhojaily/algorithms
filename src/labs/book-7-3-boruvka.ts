// Starter and model-solution code for the lab in book section 7.3.

export const starter = `// A connected graph: vertices 0 … n−1, edges [u, v, w] with distinct weights.

// Borůvka: add ALL the safe edges and recurse. Return the indices of the MST edges
// (any order). Count and label the components of F in each round, as in the book.
function boruvka(n, edges) {
  // your code here
}
`;

export const solution = `function boruvka(n, edges) {
  const F = [];
  for (;;) {
    // CountAndLabel(F)
    const adj = Array.from({ length: n }, () => []);
    for (const k of F) { const [u, v] = edges[k]; adj[u].push(v); adj[v].push(u); }
    const comp = new Array(n).fill(-1);
    let count = 0;
    for (let s = 0; s < n; s++) {
      if (comp[s] >= 0) continue;
      const st = [s]; comp[s] = count;
      while (st.length) for (const w of adj[st.pop()]) if (comp[w] < 0) { comp[w] = count; st.push(w); }
      count++;
    }
    if (count === 1) return F;
    // AddAllSafeEdges
    const safe = new Array(count).fill(-1);
    edges.forEach(([u, v, w], k) => {
      const a = comp[u], b = comp[v];
      if (a === b) return;
      if (safe[a] < 0 || w < edges[safe[a]][2]) safe[a] = k;
      if (safe[b] < 0 || w < edges[safe[b]][2]) safe[b] = k;
    });
    for (const k of new Set(safe)) F.push(k);
  }
}
`;

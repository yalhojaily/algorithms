// Starter and model-solution code for the lab in book section 7.2.

export const starter = `// A connected graph: vertices 0 … n−1, edges [u, v, w] with distinct weights.

// 1) Prim's lemma: given a set S of vertices (an array of booleans inS),
//    return the index of the lightest edge with exactly one endpoint in S (−1 if none).
function lightestCrossing(edges, inS) {
  // your code here
}

// 2) Given the indices F of the edges of an intermediate spanning forest,
//    classify every edge: 'forest', 'useless', 'safe' or 'undecided'.
function classify(n, edges, F) {
  // your code here
}
`;

export const solution = `function lightestCrossing(edges, inS) {
  let best = -1;
  edges.forEach(([u, v, w], k) => {
    if (inS[u] !== inS[v] && (best < 0 || w < edges[best][2])) best = k;
  });
  return best;
}

function classify(n, edges, F) {
  // label the components of F
  const adj = Array.from({ length: n }, () => []);
  for (const k of F) { const [u, v] = edges[k]; adj[u].push(v); adj[v].push(u); }
  const comp = new Array(n).fill(-1);
  let c = 0;
  for (let s = 0; s < n; s++) {
    if (comp[s] >= 0) continue;
    const st = [s]; comp[s] = c;
    while (st.length) for (const w of adj[st.pop()]) if (comp[w] < 0) { comp[w] = c; st.push(w); }
    c++;
  }
  // the safe edge of each component
  const safe = new Array(c).fill(-1);
  edges.forEach(([u, v, w], k) => {
    const a = comp[u], b = comp[v];
    if (a === b) return;
    if (safe[a] < 0 || w < edges[safe[a]][2]) safe[a] = k;
    if (safe[b] < 0 || w < edges[safe[b]][2]) safe[b] = k;
  });
  const inF = new Set(F), isSafe = new Set(safe);
  return edges.map(([u, v], k) =>
    inF.has(k) ? 'forest' : comp[u] === comp[v] ? 'useless' : isSafe.has(k) ? 'safe' : 'undecided');
}
`;

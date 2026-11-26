// Starter and model-solution code for the lab in book section 9.6.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w], no negative cycles.

// Fischer–Meyer / Leyzorek: start with D[u][v] = w(u → v) (0 on the diagonal, ∞ if no edge),
// then ⌈lg V⌉ times, for all u, v, x: D[u][v] = min(D[u][v], D[u][x] + D[x][v]).
function leyzorek(n, edges) {
  // your code here
}
`;

export const solution = `function leyzorek(n, edges) {
  const D = Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => (u === v ? 0 : Infinity)));
  for (const [u, v, w] of edges) D[u][v] = Math.min(D[u][v], w);
  for (let len = 1; len < n - 1; len *= 2)          // ⌈lg(V − 1)⌉ squarings
    for (let u = 0; u < n; u++)
      for (let v = 0; v < n; v++)
        for (let x = 0; x < n; x++)
          if (D[u][x] + D[x][v] < D[u][v]) D[u][v] = D[u][x] + D[x][v];
  return D;
}
`;

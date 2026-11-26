// Starter and model-solution code for the lab in book section 11.7.

export const starter = `// profit[v] for each project v (negative = cost); edges [u, v] mean "u needs v".
// Return the best set of projects as an array of booleans: closed under "needs", total profit as large as possible.

function bestProjects(profit, edges) {
  // your code here: s → profitable, costly → t, every dependency ∞; the minimum cut's s-side is the answer
}
`;

export const solution = `function bestProjects(profit, edges) {
  const n = profit.length, s = n, t = n + 1, V = n + 2, E = [];
  profit.forEach((w, v) => { if (w > 0) E.push([s, v, w]); else if (w < 0) E.push([v, t, -w]); });
  for (const [u, v] of edges) E.push([u, v, Infinity]);
  const f = E.map(() => 0);
  let seen;
  for (;;) {
    const via = new Array(V).fill(null), q = [s];
    seen = new Array(V).fill(false); seen[s] = true;
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      E.forEach(([a, b, c], k) => {
        if (a === u && !seen[b] && f[k] < c) { seen[b] = true; via[b] = [k, 1, u]; q.push(b); }
        if (b === u && !seen[a] && f[k] > 0) { seen[a] = true; via[a] = [k, -1, u]; q.push(a); }
      });
    }
    if (!seen[t]) break;
    let F = Infinity;
    for (let x = t; x !== s; x = via[x][2]) { const [k, d] = via[x]; F = Math.min(F, d > 0 ? E[k][2] - f[k] : f[k]); }
    for (let x = t; x !== s; x = via[x][2]) f[via[x][0]] += via[x][1] * F;
  }
  return profit.map((_, v) => seen[v]);           // reachable from s in the residual graph
}
`;

// Starter and model-solution code for the lab in book section 11.6.

export const starter = `// W[i] = games team i has won; left[i] = games team i still has to play (against anyone);
// G[i][j] = games left between teams i and j. Is team x mathematically eliminated?
// Return true if team x cannot finish with at least as many wins as every other team.

function isEliminated(W, left, G, x) {
  // your code here: one node per game pair, one per team, then a maximum flow
}
`;

export const solution = `function isEliminated(W, left, G, x) {
  const n = W.length, best = W[x] + left[x];
  for (let i = 0; i < n; i++) if (i !== x && W[i] > best) return true;          // trivially out
  const others = [], pairs = [];
  for (let i = 0; i < n; i++) if (i !== x) others.push(i);
  for (let a = 0; a < others.length; a++) for (let b = a + 1; b < others.length; b++)
    if (G[others[a]][others[b]] > 0) pairs.push([others[a], others[b]]);
  const team = (i) => 1 + pairs.length + others.indexOf(i), t = 1 + pairs.length + others.length, V = t + 1;
  const E = [];
  let games = 0;
  pairs.forEach(([i, j], k) => { E.push([0, 1 + k, G[i][j]]); E.push([1 + k, team(i), Infinity]); E.push([1 + k, team(j), Infinity]); games += G[i][j]; });
  for (const i of others) E.push([team(i), t, best - W[i]]);
  const f = E.map(() => 0);
  let value = 0;
  for (;;) {
    const via = new Array(V).fill(null), seen = new Array(V).fill(false), q = [0];
    seen[0] = true;
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      E.forEach(([a, b, c], k) => {
        if (a === u && !seen[b] && f[k] < c) { seen[b] = true; via[b] = [k, 1, u]; q.push(b); }
        if (b === u && !seen[a] && f[k] > 0) { seen[a] = true; via[a] = [k, -1, u]; q.push(a); }
      });
    }
    if (!seen[t]) break;
    let F = Infinity;
    for (let x2 = t; x2 !== 0; x2 = via[x2][2]) { const [k, d] = via[x2]; F = Math.min(F, d > 0 ? E[k][2] - f[k] : f[k]); }
    for (let x2 = t; x2 !== 0; x2 = via[x2][2]) f[via[x2][0]] += via[x2][1] * F;
    value += F;
  }
  return value < games;
}
`;

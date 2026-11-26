// Starter and model-solution code for the lab in book section 12.11.

export const starter = `// 3SAT → directed Hamiltonian cycle, the construction "From 3SAT" of Section 12.11, WITH separators.
// clauses: arrays of three nonzero integers (+v / −v), variables 1 … nVars (assume nVars ≥ 2); k = clauses.length.
// Row i (0-based) has W = 3k + 1 vertices, (i, j) ↦ i·W + j for 0 ≤ j ≤ 3k; clause j (0-based) uses the pair
// (i, 3j + 1), (i, 3j + 2), and (i, 3j + 3) is a separator. Clause j ↦ nVars·W + j.
// Return { n, edges } with directed edges [u, v].

function satToHamCycle(nVars, clauses) {
  // your code here
}
`;

export const solution = `function satToHamCycle(nVars, clauses) {
  const k = clauses.length, W = 3 * k + 1, id = (i, j) => i * W + j, cl = (j) => nVars * W + j, edges = [];
  for (let i = 0; i < nVars; i++)
    for (let j = 1; j < W; j++) edges.push([id(i, j - 1), id(i, j)], [id(i, j), id(i, j - 1)]);   // doubly linked row
  for (let i = 0; i < nVars; i++) {
    const i2 = (i + 1) % nVars;                                     // the last row connects back to the first
    for (const a of [0, W - 1]) for (const b of [0, W - 1]) edges.push([id(i, a), id(i2, b)]);
  }
  clauses.forEach((c, j) => {
    for (const l of c) {
      const i = Math.abs(l) - 1, L = id(i, 3 * j + 1), R = id(i, 3 * j + 2);
      if (l > 0) edges.push([L, cl(j)], [cl(j), R]);                 // usable when the row is walked left to right
      else edges.push([R, cl(j)], [cl(j), L]);                       // usable right to left
    }
  });
  return { n: nVars * W + k, edges };
}
`;

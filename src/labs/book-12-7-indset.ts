// Starter and model-solution code for the lab in book section 12.7.

export const starter = `// 3SAT → MaxIndSet. clauses: arrays of three nonzero integers (+v / −v, variables from 1).
// Return { n, edges, k }: vertex 3j + i is literal i of clause j; triangle edges inside each clause,
// and an edge between every literal and every occurrence of its negation in another clause; k = number of clauses.

function satToIndSet(clauses) {
  // your code here
}
`;

export const solution = `function satToIndSet(clauses) {
  const lits = clauses.flat(), k = clauses.length, edges = [];
  for (let j = 0; j < k; j++) edges.push([3 * j, 3 * j + 1], [3 * j, 3 * j + 2], [3 * j + 1, 3 * j + 2]);
  for (let p = 0; p < lits.length; p++)
    for (let q = p + 1; q < lits.length; q++)
      if (Math.floor(p / 3) !== Math.floor(q / 3) && lits[p] === -lits[q]) edges.push([p, q]);
  return { n: 3 * k, edges, k };
}
`;

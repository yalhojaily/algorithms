// Starter and model-solution code for the lab in book section 4.1.

export const starter = `// Files on a tape. L[i] is the length of file i, F[i] how many times it will be read.

// 1) The total cost of storing the files in the given order (an array of file indices):
//    Σ over positions k of F[order[k]] × (L[order[0]] + … + L[order[k]]).
function tapeCost(order, L, F) {
  // your code here
}

// 2) An optimal order (Lemma 4.2). Return an array of indices.
function bestOrder(L, F) {
  // your code here
}
`;

export const solution = `function tapeCost(order, L, F) {
  let pos = 0, total = 0;
  for (const k of order) { pos += L[k]; total += F[k] * pos; }
  return total;
}

function bestOrder(L, F) {
  // sort by L/F; compare L[a]F[b] with L[b]F[a] to stay in integers
  return L.map((_, i) => i).sort((a, b) => L[a] * F[b] - L[b] * F[a]);
}
`;

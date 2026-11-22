// Starter and model-solution code for the lab in book section 4.2.

export const starter = `// Class scheduling. S[i] and F[i] are the start and finish times of class i.
// Two classes conflict unless one starts strictly after the other finishes (as in the book).

// 1) GreedySchedule: return the indices of a largest conflict-free set of classes.
function greedySchedule(S, F) {
  // your code here
}

// 2) Check your answer: true iff the chosen classes are pairwise conflict-free.
function conflictFree(S, F, X) {
  // your code here
}
`;

export const solution = `function greedySchedule(S, F) {
  const idx = S.map((_, i) => i).sort((a, b) => F[a] - F[b]);
  const X = [];
  let last = -Infinity;
  for (const i of idx) if (S[i] > last) { X.push(i); last = F[i]; }
  return X;
}

function conflictFree(S, F, X) {
  for (let a = 0; a < X.length; a++)
    for (let b = a + 1; b < X.length; b++) {
      const i = X[a], j = X[b];
      if (!(S[i] > F[j] || S[j] > F[i])) return false;
    }
  return true;
}
`;

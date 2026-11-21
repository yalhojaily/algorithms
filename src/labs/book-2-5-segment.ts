// Starter and model-solution code for the lab in book section 2.5.

export const starter = `// Text segmentation, in the index formulation: the string A is "global", and every
// subproblem is a suffix A[i ..]. isWord(w) and score(w) are given to you as black boxes.

// 1) Can A be split into words?
function splittable(A, isWord) {
  // your code here
}

// 2) Return one segmentation as an array of words, or null.
function segmentation(A, isWord) {
  // your code here
}

// 3) The maximum total score of a segmentation of A into pieces (every piece is allowed;
//    score decides how good it is). The empty string scores 0.
function maxScore(A, score) {
  // your code here
}
`;

export const solution = `function splittable(A, isWord) {
  const n = A.length;
  const go = (i) => {
    if (i === n) return true;
    for (let j = i + 1; j <= n; j++) {
      if (isWord(A.slice(i, j)) && go(j)) return true;
    }
    return false;
  };
  return go(0);
}

function segmentation(A, isWord) {
  const n = A.length;
  const go = (i) => {
    if (i === n) return [];
    for (let j = i + 1; j <= n; j++) {
      if (isWord(A.slice(i, j))) {
        const rest = go(j);
        if (rest) return [A.slice(i, j), ...rest];
      }
    }
    return null;
  };
  return go(0);
}

function maxScore(A, score) {
  const n = A.length;
  const go = (i) => {
    if (i === n) return 0;
    let best = -Infinity;
    for (let j = i + 1; j <= n; j++) best = Math.max(best, score(A.slice(i, j)) + go(j));
    return best;
  };
  return go(0);
}
`;

// Starter and model-solution code for the lab in book section 3.3.

export const starter = `// FastSplittable, and a version that also returns the words.
// isWord(w) is a black box given by the tests. Index i is 0-based here: the suffix A.slice(i).

// 1) true iff A can be split into words. O(n²) calls to isWord.
function fastSplittable(A, isWord) {
  // your code here
}

// 2) Return one segmentation as an array of words, or null. Fill the table first, then walk it.
function fastSegmentation(A, isWord) {
  // your code here
}
`;

export const solution = `function fastSplittable(A, isWord) {
  const n = A.length, T = new Array(n + 1).fill(false);
  T[n] = true;                                    // the empty suffix
  for (let i = n - 1; i >= 0; i--)
    for (let j = i + 1; j <= n; j++)
      if (T[j] && isWord(A.slice(i, j))) { T[i] = true; break; }
  return T[0];
}

function fastSegmentation(A, isWord) {
  const n = A.length, next = new Array(n + 1).fill(-1), T = new Array(n + 1).fill(false);
  T[n] = true;
  for (let i = n - 1; i >= 0; i--)
    for (let j = i + 1; j <= n; j++)
      if (T[j] && isWord(A.slice(i, j))) { T[i] = true; next[i] = j; break; }
  if (!T[0]) return null;
  const out = [];
  for (let i = 0; i < n; i = next[i]) out.push(A.slice(i, next[i]));
  return out;
}
`;

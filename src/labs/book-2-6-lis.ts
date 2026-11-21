// Starter and model-solution code for the lab in sections 2.6 and 2.7.

export const starter = `// Two backtracking strategies for the length of the longest (strictly) increasing subsequence.

// 1) Take 1 (section 2.6): for each element in turn, take it or skip it.
//    Write LISbigger(i, j) on the array with a sentinel −Infinity in front.
function lisTake1(A) {
  // your code here
}

// 2) Take 2 (section 2.7): LISfirst(i) = 1 + max over j > i with A[j] > A[i] of LISfirst(j).
function lisTake2(A) {
  // your code here
}
`;

export const solution = `function lisTake1(A) {
  const B = [-Infinity, ...A], n = A.length;
  const go = (i, j) => {                 // longest increasing subsequence of B[j..n] with every element > B[i]
    if (j > n) return 0;
    if (B[i] >= B[j]) return go(i, j + 1);
    return Math.max(go(i, j + 1), 1 + go(j, j + 1));
  };
  return go(0, 1);
}

function lisTake2(A) {
  const B = [-Infinity, ...A], n = A.length;
  const first = (i) => {                 // longest increasing subsequence of B[i..n] that starts with B[i]
    let best = 0;
    for (let j = i + 1; j <= n; j++) if (B[j] > B[i]) best = Math.max(best, first(j));
    return 1 + best;
  };
  return first(0) - 1;
}
`;

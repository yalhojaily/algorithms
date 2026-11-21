// Starter and model-solution code for the lab in book section 2.3.

export const starter = `// SubsetSum with the index formulation: decide about X[i] (the last remaining element) and recurse.
// X is an array of positive integers.

// 1) Does any subset of X sum to T?
function subsetSum(X, T) {
  // your code here (write a helper go(i, T) that looks only at X[0 .. i-1])
}

// 2) Return one subset (an array of values from X) that sums to T, or null if none exists.
function constructSubset(X, T) {
  // your code here
}
`;

export const solution = `function subsetSum(X, T) {
  const go = (i, t) => {
    if (t === 0) return true;
    if (t < 0 || i === 0) return false;
    return go(i - 1, t - X[i - 1]) || go(i - 1, t);   // with X[i], or without it
  };
  return go(X.length, T);
}

function constructSubset(X, T) {
  const go = (i, t) => {
    if (t === 0) return [];
    if (t < 0 || i === 0) return null;
    const without = go(i - 1, t);
    if (without) return without;
    const withIt = go(i - 1, t - X[i - 1]);
    return withIt ? [...withIt, X[i - 1]] : null;
  };
  return go(X.length, T);
}
`;

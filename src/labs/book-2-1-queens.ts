// Starter and model-solution code for the lab in book section 2.1.

export const starter = `// Gauss and Laquière's backtracking for n queens.
// A solution is an array Q of length n where Q[r] is the column (1 .. n) of the queen in row r + 1.

// 1) Return an array of all solutions, in the order PlaceQueens finds them
//    (rows top to bottom, columns left to right).
function allQueens(n) {
  // your code here
}

// 2) Count the solutions without storing them. It must handle n = 10 quickly.
function countQueens(n) {
  // your code here
}
`;

export const solution = `function allQueens(n) {
  const out = [], Q = [];
  const place = (r) => {              // r is 0-based here: Q[0 .. r-1] are placed
    if (r === n) { out.push(Q.slice()); return; }
    for (let j = 1; j <= n; j++) {
      let legal = true;
      for (let i = 0; i < r; i++) {
        if (Q[i] === j || Q[i] === j + r - i || Q[i] === j - r + i) { legal = false; break; }
      }
      if (legal) { Q[r] = j; place(r + 1); }
    }
    Q.length = r;
  };
  place(0);
  return out;
}

function countQueens(n) {
  const Q = [];
  const place = (r) => {
    if (r === n) return 1;
    let total = 0;
    for (let j = 1; j <= n; j++) {
      let legal = true;
      for (let i = 0; i < r; i++) {
        if (Q[i] === j || Q[i] === j + r - i || Q[i] === j - r + i) { legal = false; break; }
      }
      if (legal) { Q[r] = j; total += place(r + 1); }
    }
    return total;
  };
  return place(0);
}
`;

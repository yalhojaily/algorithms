// Starter and model-solution code for the lab in lesson 0.6.
// Every function here is an induction proof turned into a recursive program.

export const starter = `// 1) Tile a 2^k × 2^k board whose square (mr, mc) is missing, with L-trominoes.
//    Return the board as a 2D array: 0 for the missing square, and the same
//    number 1, 2, 3, … on the three squares of each L.
//    Follow the induction proof: put one L at the center, then recurse on the 4 quadrants.
function tile(k, mr, mc) {
  // your code here
}

// 2) Postage with 4- and 5-riyal stamps, for any n ≥ 12 (strong induction).
//    Return [a, b] with 4a + 5b = n.
//    Base cases n = 12, 13, 14, 15; otherwise use the answer for n − 4.
function postage(n) {
  // your code here
}

// 3) Prime factorisation of n ≥ 2, smallest factors first (strong induction).
//    factorize(60) → [2, 2, 3, 5]
function factorize(n) {
  // your code here
}

// 4) Tower of Hanoi: move n disks from peg 'A' to peg 'C' using 'B'.
//    Return the list of moves, e.g. [['A', 'C'], ['A', 'B'], ...].
function hanoi(n, from = 'A', to = 'C', via = 'B') {
  // your code here
}
`;

export const solution = `function tile(k, mr, mc) {
  const n = 2 ** k;
  const B = Array.from({ length: n }, () => Array(n).fill(0));
  let next = 1;
  function go(top, left, size, r, c) {
    if (size === 1) return;
    const h = size / 2;
    const id = next++;
    const quads = [[top, left], [top, left + h], [top + h, left], [top + h, left + h]];
    const centers = [[top + h - 1, left + h - 1], [top + h - 1, left + h], [top + h, left + h - 1], [top + h, left + h]];
    quads.forEach(([qt, ql], q) => {
      const inside = r >= qt && r < qt + h && c >= ql && c < ql + h;
      if (inside) {
        go(qt, ql, h, r, c);
      } else {
        const [cr, cc] = centers[q];
        B[cr][cc] = id;
        go(qt, ql, h, cr, cc);
      }
    });
  }
  go(0, 0, n, mr, mc);
  return B;
}

function postage(n) {
  const base = { 12: [3, 0], 13: [2, 1], 14: [1, 2], 15: [0, 3] };
  if (base[n]) return base[n];
  const [a, b] = postage(n - 4);
  return [a + 1, b];
}

function factorize(n) {
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return [d, ...factorize(n / d)];
  }
  return [n];
}

function hanoi(n, from = 'A', to = 'C', via = 'B') {
  if (n === 0) return [];
  return [...hanoi(n - 1, from, via, to), [from, to], ...hanoi(n - 1, via, to, from)];
}
`;

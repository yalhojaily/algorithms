// Starter and model-solution code for the lab in book section 3.2.

export const starter = `// FastRecFibo: returns the pair [F(n−1), F(n)] as BigInts, using
//   F(2m−1) = F(m−1)² + F(m)²   and   F(2m) = F(m)·(2F(m−1) + F(m)).
// The book's base case is n = 1 → [0n, 1n]. Make fastFibo(0) return 0n too.

function fastRecFibo(n) {
  // your code here
}

function fastFibo(n) {
  // your code here
}
`;

export const solution = `function fastRecFibo(n) {
  if (n === 1) return [0n, 1n];
  const m = Math.floor(n / 2);
  const [hprv, hcur] = fastRecFibo(m);            // F(m−1), F(m)
  const prev = hprv * hprv + hcur * hcur;          // F(2m−1)
  const curr = hcur * (2n * hprv + hcur);          // F(2m)
  const next = prev + curr;                        // F(2m+1)
  return n % 2 === 0 ? [prev, curr] : [curr, next];
}

function fastFibo(n) {
  return n === 0 ? 0n : fastRecFibo(n)[1];
}
`;

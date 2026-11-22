// Starter and model-solution code for the lab in book section 3.1.

export const starter = `// Three Fibonacci algorithms. Return BigInt values (write 0n, 1n, ...), because F(n) grows fast.

// 1) MemFibo: the recursive definition plus a memo table. Must handle n = 1000 instantly.
function memoFibo(n) {
  // your code here
}

// 2) IterFibo: fill the table deliberately, in increasing order.
function iterFibo(n) {
  // your code here
}

// 3) IterFibo2: the same, keeping only the two newest values (O(1) numbers of storage).
function iterFibo2(n) {
  // your code here
}
`;

export const solution = `function memoFibo(n) {
  const F = new Map();
  const go = (k) => {
    if (k < 2) return BigInt(k);
    if (!F.has(k)) F.set(k, go(k - 1) + go(k - 2));
    return F.get(k);
  };
  for (let k = 2; k < n; k += 500) go(k);   // warm the table in chunks so the recursion stays shallow
  return go(n);
}

function iterFibo(n) {
  const F = [0n, 1n];
  for (let i = 2; i <= n; i++) F[i] = F[i - 1] + F[i - 2];
  return F[n];
}

function iterFibo2(n) {
  let prev = 1n, curr = 0n;                  // the book's base case F(−1) = 1
  for (let i = 1; i <= n; i++) { const next = curr + prev; prev = curr; curr = next; }
  return curr;
}
`;

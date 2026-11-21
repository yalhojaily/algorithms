// Starter and model-solution code for the lab in lesson 0.5.

export const starter = `// A relation R on a set A is an array of pairs: [[1, 2], [2, 3], ...] means 1 R 2, 2 R 3, ...
// Tip: put the pairs in a Set of strings for fast lookup:
//   const S = new Set(R.map(([a, b]) => a + ',' + b));   S.has(1 + ',' + 2)

// 1) ∀a ∈ A. a R a
function isReflexive(A, R) {
  // your code here
}

// 2) ∀a ∀b. a R b → b R a
function isSymmetric(R) {
  // your code here
}

// 3) ∀a ∀b ∀c. (a R b ∧ b R c) → a R c
function isTransitive(R) {
  // your code here
}

// 4) Equivalence classes of an equivalence relation, each class sorted,
//    classes ordered by their smallest element.
//    classes([1,2,3,4], "same parity") → [[1, 3], [2, 4]]
function equivalenceClasses(A, R) {
  // your code here
}

// A function f: {0..n-1} → {0..m-1} is an array: f[i] is the image of i.

// 5) f is one-to-one?
function isInjective(f) {
  // your code here
}

// 6) f is onto {0, …, m-1}?
function isSurjective(f, m) {
  // your code here
}

// 7) (g ∘ f)(i) = g(f(i))
function compose(g, f) {
  // your code here
}

// 8) Transitive closure (Warshall) of a relation on {0..n-1}.
//    Return an n×n array of booleans: C[i][j] is true when you can go i → … → j.
function transitiveClosure(n, R) {
  // your code here
}
`;

export const solution = `const key = (a, b) => a + ',' + b;

function isReflexive(A, R) {
  const S = new Set(R.map(([a, b]) => key(a, b)));
  return A.every((a) => S.has(key(a, a)));
}

function isSymmetric(R) {
  const S = new Set(R.map(([a, b]) => key(a, b)));
  return R.every(([a, b]) => S.has(key(b, a)));
}

function isTransitive(R) {
  const S = new Set(R.map(([a, b]) => key(a, b)));
  return R.every(([a, b]) => R.every(([c, d]) => c !== b || S.has(key(a, d))));
}

function equivalenceClasses(A, R) {
  const S = new Set(R.map(([a, b]) => key(a, b)));
  const done = new Set();
  const out = [];
  for (const a of [...A].sort((x, y) => x - y)) {
    if (done.has(a)) continue;
    const cls = A.filter((b) => S.has(key(a, b))).sort((x, y) => x - y);
    cls.forEach((b) => done.add(b));
    out.push(cls);
  }
  return out;
}

function isInjective(f) {
  return new Set(f).size === f.length;
}

function isSurjective(f, m) {
  const img = new Set(f);
  for (let y = 0; y < m; y++) if (!img.has(y)) return false;
  return true;
}

function compose(g, f) {
  return f.map((y) => g[y]);
}

function transitiveClosure(n, R) {
  const C = Array.from({ length: n }, () => Array(n).fill(false));
  for (const [a, b] of R) C[a][b] = true;
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      if (C[i][k])
        for (let j = 0; j < n; j++)
          if (C[k][j]) C[i][j] = true;
  return C;
}
`;

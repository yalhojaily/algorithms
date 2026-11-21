// Starter and model-solution code for the lab in lesson 2.5.

export const starter = `// 1) Polynomial string hash: h(s) = (s0·B^(L−1) + s1·B^(L−2) + … + s_{L−1}) mod m, with B = 31,
//    where s_i = s.charCodeAt(i). Use Horner's rule and take "mod m" at every step,
//    so the numbers stay small. hashString("", m) = 0.
function hashString(s, m) {
  // your code here
}

// 2) A hash set of integers with chaining. Rules:
//    - this.t is an array of m buckets (arrays); use h(k) = ((a·k + b) mod p) mod m with the given a, b, p.
//    - when n would exceed m, double m and re-insert every key (rehash).
//    - Do NOT use JavaScript's Set or Map inside this class.
class ChainedHashSet {
  constructor() {
    this.p = 1000003;                               // a prime larger than the keys we use
    this.a = 1 + Math.floor(Math.random() * (this.p - 1));
    this.b = Math.floor(Math.random() * this.p);
    this.m = 8;
    this.n = 0;
    this.t = Array.from({ length: this.m }, () => []);
  }
  h(k) { return ((this.a * k + this.b) % this.p) % this.m; }
  size() { return this.n; }
  has(k) {
    // your code here
  }
  add(k) {
    // your code here (do nothing if k is already present)
  }
  delete(k) {
    // your code here (return true if k was present)
  }
  longestChain() { return Math.max(...this.t.map((c) => c.length)); }
}

// 3) Return indices [i, j] with i < j and A[i] + A[j] === target, or null. O(n) expected.
//    (Here you MAY use a JavaScript Map.)
function twoSum(A, target) {
  // your code here
}

// 4) The length of the longest run of consecutive integers that all appear in A,
//    e.g. [100, 4, 200, 1, 3, 2] → 4 (1, 2, 3, 4). O(n) expected, using a Set.
function longestConsecutive(A) {
  // your code here
}
`;

export const solution = `function hashString(s, m) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % m;   // Horner, mod at each step
  return h;
}

class ChainedHashSet {
  constructor() {
    this.p = 1000003;
    this.a = 1 + Math.floor(Math.random() * (this.p - 1));
    this.b = Math.floor(Math.random() * this.p);
    this.m = 8;
    this.n = 0;
    this.t = Array.from({ length: this.m }, () => []);
  }
  h(k) { return ((this.a * k + this.b) % this.p) % this.m; }
  size() { return this.n; }
  has(k) { return this.t[this.h(k)].includes(k); }
  add(k) {
    if (this.has(k)) return;
    if (this.n + 1 > this.m) this.resize(2 * this.m);
    this.t[this.h(k)].push(k);
    this.n++;
  }
  delete(k) {
    const c = this.t[this.h(k)];
    const i = c.indexOf(k);
    if (i < 0) return false;
    c[i] = c[c.length - 1]; c.pop();          // order inside a chain does not matter
    this.n--;
    return true;
  }
  resize(m) {
    const old = this.t;
    this.m = m;
    this.t = Array.from({ length: m }, () => []);
    for (const c of old) for (const k of c) this.t[this.h(k)].push(k);   // h depends on m: rehash all
  }
  longestChain() { return Math.max(...this.t.map((c) => c.length)); }
}

function twoSum(A, target) {
  const seen = new Map();                     // value → index
  for (let j = 0; j < A.length; j++) {
    const need = target - A[j];
    if (seen.has(need)) return [seen.get(need), j];
    if (!seen.has(A[j])) seen.set(A[j], j);
  }
  return null;
}

function longestConsecutive(A) {
  const S = new Set(A);
  let best = 0;
  for (const x of S) {
    if (S.has(x - 1)) continue;               // start only at the beginning of a run
    let len = 1;
    while (S.has(x + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}
`;

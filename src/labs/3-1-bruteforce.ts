// Starter and model-solution code for the lab in lesson 3.1.

export const starter = `// 1) All 2^n subsets of A. Each subset keeps the original order of its elements.
//    The order of the subsets in the result does not matter.
function subsets(A) {
  // your code here (hint: a loop over masks 0 .. 2^n − 1, or recursion: take A[i] or skip it)
}

// 2) All n! orderings of A (the elements of A are distinct). Any order of the list is fine.
function permutations(A) {
  // your code here
}

// 3) How many subsets of A (the empty subset included) have sum exactly t? Brute force over all masks.
function subsetSumCount(A, t) {
  // your code here
}

// 4) Travelling salesman by brute force. D is an n × n distance matrix (n ≤ 9).
//    Return the length of the shortest tour that starts at city 0, visits every city once,
//    and returns to 0. Fix city 0 first, and try every order of the other n − 1 cities.
function tspBrute(D) {
  // your code here
}

// 5) Meet in the middle: the same count as subsetSumCount, but for n up to 40.
//    Split A into two halves, list all subset sums of each half (2^(n/2) each),
//    and count the pairs (a from the left list, b from the right) with a + b = t.
function subsetSumMITM(A, t) {
  // your code here
}
`;

export const solution = `function subsets(A) {
  const out = [];
  for (let mask = 0; mask < 1 << A.length; mask++) {
    const s = [];
    for (let i = 0; i < A.length; i++) if (mask >> i & 1) s.push(A[i]);
    out.push(s);
  }
  return out;
}

function permutations(A) {
  const out = [], cur = [], used = new Array(A.length).fill(false);
  const go = () => {
    if (cur.length === A.length) { out.push(cur.slice()); return; }
    for (let i = 0; i < A.length; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(A[i]);
      go();
      cur.pop(); used[i] = false;
    }
  };
  go();
  return out;
}

function subsetSumCount(A, t) {
  let count = 0;
  for (let mask = 0; mask < 1 << A.length; mask++) {
    let s = 0;
    for (let i = 0; i < A.length; i++) if (mask >> i & 1) s += A[i];
    if (s === t) count++;
  }
  return count;
}

function tspBrute(D) {
  const n = D.length;
  if (n <= 1) return 0;
  let best = Infinity;
  const used = new Array(n).fill(false);
  used[0] = true;
  const go = (city, k, len) => {           // k cities visited so far, ending at city
    if (len >= best) return;               // a small, safe shortcut
    if (k === n) { best = Math.min(best, len + D[city][0]); return; }
    for (let c = 1; c < n; c++) if (!used[c]) {
      used[c] = true;
      go(c, k + 1, len + D[city][c]);
      used[c] = false;
    }
  };
  go(0, 1, 0);
  return best;
}

function allSums(B) {
  // all 2^|B| subset sums, built by doubling: O(2^|B|)
  let sums = [0];
  for (const x of B) sums = sums.concat(sums.map((s) => s + x));
  return sums;
}

function subsetSumMITM(A, t) {
  const h = A.length >> 1;
  const L = allSums(A.slice(0, h)), R = allSums(A.slice(h));
  const count = new Map();
  for (const s of R) count.set(s, (count.get(s) || 0) + 1);
  let total = 0;
  for (const s of L) total += count.get(t - s) || 0;
  return total;
}
`;

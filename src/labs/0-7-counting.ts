// Starter and model-solution code for the lab in lesson 0.7.

export const starter = `// 1) n! as a BigInt (numbers above 2^53 lose precision as ordinary JS numbers).
//    factorial(5) → 120n.  BigInt literals end in n: 1n, 2n; BigInt(i) converts a number.
function factorial(n) {
  // your code here
}

// 2) The binomial coefficient C(n, k), using Pascal's identity:
//    C(n, k) = C(n−1, k−1) + C(n−1, k), with C(n, 0) = C(n, n) = 1.
//    Build the triangle row by row — do NOT compute factorials.
function binom(n, k) {
  // your code here
}

// 3) All orderings of the array arr. permutations([1, 2, 3]) has 6 arrays.
function permutations(arr) {
  // your code here
}

// 4) All k-element subsets of arr, each subset in the order of arr.
//    combinations([1, 2, 3, 4], 2) → [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
function combinations(arr, k) {
  // your code here
}

// 5) How many different strings are anagrams of word (the bookkeeper rule)?
//    anagrams('BANANA') → 60
function anagrams(word) {
  // your code here
}
`;

export const solution = `function factorial(n) {
  let p = 1n;
  for (let i = 2; i <= n; i++) p *= BigInt(i);
  return p;
}

function binom(n, k) {
  if (k < 0 || k > n) return 0;
  let row = [1];
  for (let r = 1; r <= n; r++) {
    const next = [1];
    for (let c = 1; c < r; c++) next.push(row[c - 1] + row[c]);
    next.push(1);
    row = next;
  }
  return row[k];
}

function permutations(arr) {
  if (arr.length === 0) return [[]];
  const out = [];
  arr.forEach((x, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([x, ...p]);
  });
  return out;
}

function combinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function anagrams(word) {
  const counts = {};
  for (const ch of word) counts[ch] = (counts[ch] || 0) + 1;
  let r = factorial(word.length);
  for (const c of Object.values(counts)) r /= factorial(c);
  return Number(r);
}
`;

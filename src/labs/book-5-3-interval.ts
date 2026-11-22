// Starter and model-solution code for the lab in book section 5.3.

export const starter = `// The intersection graph of intervals [a, b] on the real line:
// one vertex per interval, and an edge between two intervals that share a point.

// 1) The edges, as pairs [i, j] with i < j (any order of pairs).
function intervalEdges(intervals) {
  // your code here
}

// 2) The dependency graph of the Fibonacci recurrence F(i) = F(i−1) + F(i−2):
//    vertices 0 … n, edges [i−1, i] and [i−2, i] for 2 ≤ i ≤ n. How many edges?
function fibDependencyEdges(n) {
  // your code here
}
`;

export const solution = `function intervalEdges(intervals) {
  const out = [];
  for (let i = 0; i < intervals.length; i++)
    for (let j = i + 1; j < intervals.length; j++) {
      const [a, b] = intervals[i], [c, d] = intervals[j];
      if (a <= d && c <= b) out.push([i, j]);   // they overlap
    }
  return out;
}

function fibDependencyEdges(n) {
  return n < 2 ? 0 : 2 * (n - 1);
}
`;

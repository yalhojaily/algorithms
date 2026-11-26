// Starter and model-solution code for the lab in book section 10.1.

export const starter = `// A flow network: vertices 0 … n−1, s = 0, t = n − 1, edges [u, v, c] (capacity c ≥ 0).
// A flow is an array f with f[k] on edge k.

// 1) |f|: the total flow out of s minus the total flow into s.
function flowValue(n, edges, f) {
  // your code here
}

// 2) Is f a feasible (s, t)-flow? 0 ≤ f[k] ≤ c on every edge, and conservation
//    (flow in = flow out) at every vertex except s and t.
function isFeasibleFlow(n, edges, f) {
  // your code here
}
`;

export const solution = `function flowValue(n, edges, f) {
  let v = 0;
  edges.forEach(([u, w], k) => { if (u === 0) v += f[k]; if (w === 0) v -= f[k]; });
  return v;
}

function isFeasibleFlow(n, edges, f) {
  const net = new Array(n).fill(0);                 // in − out
  for (let k = 0; k < edges.length; k++) {
    const [u, v, c] = edges[k];
    if (f[k] < 0 || f[k] > c) return false;
    net[u] -= f[k]; net[v] += f[k];
  }
  for (let v = 1; v < n - 1; v++) if (net[v] !== 0) return false;
  return true;
}
`;

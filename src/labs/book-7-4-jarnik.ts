// Starter and model-solution code for the lab in book section 7.4.

export const starter = `// A connected graph: vertices 0 … n−1, edges [u, v, w] with distinct weights.
// A ready binary heap of [priority, value] pairs:
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(p, x) {
    const a = this.a; a.push([p, x]);
    let i = a.length - 1;
    while (i > 0) { const j = (i - 1) >> 1; if (a[j][0] <= a[i][0]) break; [a[i], a[j]] = [a[j], a[i]]; i = j; }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

// Jarník: grow one tree T from vertex 0, repeatedly adding T's safe edge.
// Keep the edges leaving T in the heap, keyed by weight. Return the MST edge indices.
function jarnik(n, edges) {
  // your code here
}
`;

export const solution = `class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(p, x) {
    const a = this.a; a.push([p, x]);
    let i = a.length - 1;
    while (i > 0) { const j = (i - 1) >> 1; if (a[j][0] <= a[i][0]) break; [a[i], a[j]] = [a[j], a[i]]; i = j; }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

function jarnik(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(([u, v], k) => { adj[u].push(k); adj[v].push(k); });
  const inT = new Array(n).fill(false), T = [], pq = new MinHeap();
  const add = (v) => { inT[v] = true; for (const k of adj[v]) pq.push(edges[k][2], k); };
  add(0);
  while (pq.size && T.length < n - 1) {
    const [, k] = pq.pop();
    const [u, v] = edges[k];
    if (inT[u] && inT[v]) continue;          // useless: both endpoints already in T
    T.push(k);                                // T's safe edge
    add(inT[u] ? v : u);
  }
  return T;
}
`;

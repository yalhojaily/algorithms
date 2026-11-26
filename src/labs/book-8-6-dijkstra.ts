// Starter and model-solution code for the lab in book section 8.6.

export const starter = `// A directed graph: vertices 0 … n−1, edges [u, v, w] with NON-NEGATIVE weights.
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

// Dijkstra: shortest-path distances from s (Infinity if unreachable), in O(E log V).
// With a plain binary heap there is no DecreaseKey: push the vertex again with its new key,
// and ignore stale entries when you pop them.
function dijkstra(n, edges, s) {
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

function dijkstra(n, edges, s) {
  const out = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) out[u].push([v, w]);
  const dist = new Array(n).fill(Infinity), pq = new MinHeap();
  dist[s] = 0;
  pq.push(0, s);
  while (pq.size) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;                  // a stale copy: u was improved after this push
    for (const [v, w] of out[u])
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push(dist[v], v); }   // relax
  }
  return dist;
}
`;

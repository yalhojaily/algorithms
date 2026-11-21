// Starter and model-solution code for the lab in book section 0.3.

export const starter = `// ApportionCongress with a real priority queue: a binary max-heap.
// The heap is given; you write the algorithm on top of it.

class MaxHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  // larger priority first; on equal priority the smaller state index wins
  _gt(i, j) { const x = this.a[i], y = this.a[j]; return x.p > y.p || (x.p === y.p && x.s < y.s); }
  insert(s, p) {
    const a = this.a; a.push({ s, p });
    let i = a.length - 1;
    while (i > 0) { const up = (i - 1) >> 1; if (!this._gt(i, up)) break; [a[i], a[up]] = [a[up], a[i]]; i = up; }
  }
  extractMax() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let b = i;
        if (l < a.length && this._gt(l, b)) b = l;
        if (r < a.length && this._gt(r, b)) b = r;
        if (b === i) break; [a[i], a[b]] = [a[b], a[i]]; i = b;
      }
    }
    return top;
  }
}

// 1) Huntington-Hill. pop: array of populations (index 0 .. n−1), R ≥ n.
//    Give every state one seat, then hand out the remaining R − n seats one at a time
//    to the state with the largest P / √(r(r+1)). Return the array of seats.
function huntingtonHill(pop, R) {
  // your code here
}

// 2) The same loop for any priority function priority(P, r), with NO free first seat:
//    every state starts at r = 0 and all R seats go through the queue.
//    D'Hondt is (P, r) => P / (r + 1); Webster is (P, r) => P / (2r + 1).
function apportionBy(pop, R, priority) {
  // your code here
}
`;

export const solution = `class MaxHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  _gt(i, j) { const x = this.a[i], y = this.a[j]; return x.p > y.p || (x.p === y.p && x.s < y.s); }
  insert(s, p) {
    const a = this.a; a.push({ s, p });
    let i = a.length - 1;
    while (i > 0) { const up = (i - 1) >> 1; if (!this._gt(i, up)) break; [a[i], a[up]] = [a[up], a[i]]; i = up; }
  }
  extractMax() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let b = i;
        if (l < a.length && this._gt(l, b)) b = l;
        if (r < a.length && this._gt(r, b)) b = r;
        if (b === i) break; [a[i], a[b]] = [a[b], a[i]]; i = b;
      }
    }
    return top;
  }
}

function huntingtonHill(pop, R) {
  const n = pop.length, rep = new Array(n).fill(1), pq = new MaxHeap();
  for (let s = 0; s < n; s++) pq.insert(s, pop[s] / Math.sqrt(2));
  for (let i = 0; i < R - n; i++) {          // the book prints "n − R"; it means R − n
    const { s } = pq.extractMax();
    rep[s]++;
    pq.insert(s, pop[s] / Math.sqrt(rep[s] * (rep[s] + 1)));
  }
  return rep;
}

function apportionBy(pop, R, priority) {
  const n = pop.length, rep = new Array(n).fill(0), pq = new MaxHeap();
  for (let s = 0; s < n; s++) pq.insert(s, priority(pop[s], 0));
  for (let i = 0; i < R; i++) {
    const { s } = pq.extractMax();
    rep[s]++;
    pq.insert(s, priority(pop[s], rep[s]));
  }
  return rep;
}
`;

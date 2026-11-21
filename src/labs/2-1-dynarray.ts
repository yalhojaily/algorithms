// Starter and model-solution code for the lab in lesson 2.1.

export const starter = `// A dynamic array built on a FIXED-size backing array.
// Rule: this.a is created with new Array(capacity) and you never write at an index >= capacity.
// When it is full, allocate a new array of DOUBLE the capacity and copy (count every copied element in this.copies).
// When pop leaves it at most a QUARTER full, halve the capacity (never below 1).

class DynArray {
  constructor() {
    this.cap = 1;
    this.n = 0;
    this.a = new Array(this.cap);
    this.copies = 0;
  }
  size() { return this.n; }
  capacity() { return this.cap; }

  // Move the elements into a new backing array of capacity newCap.
  resize(newCap) {
    // your code here
  }

  // Throw a RangeError if i is not in 0..n-1.
  get(i) {
    // your code here
  }
  set(i, x) {
    // your code here
  }

  push(x) {
    // your code here
  }
  pop() {
    // your code here (throw a RangeError on an empty array)
  }

  // Insert x at index i (0 <= i <= n), shifting later elements right. O(n − i) plus any resize.
  insertAt(i, x) {
    // your code here
  }
  // Remove and return the element at index i, shifting later elements left.
  removeAt(i) {
    // your code here
  }
}

// For the timing experiment: push 0, 1, ..., n−1 and return the array.
function buildDyn(n) {
  const d = new DynArray();
  for (let i = 0; i < n; i++) d.push(i);
  return d;
}
`;

export const solution = `class DynArray {
  constructor() {
    this.cap = 1;
    this.n = 0;
    this.a = new Array(this.cap);
    this.copies = 0;
  }
  size() { return this.n; }
  capacity() { return this.cap; }

  resize(newCap) {
    const b = new Array(newCap);
    for (let k = 0; k < this.n; k++) b[k] = this.a[k];
    this.copies += this.n;
    this.a = b;
    this.cap = newCap;
  }

  check(i) { if (!Number.isInteger(i) || i < 0 || i >= this.n) throw new RangeError('index ' + i); }
  get(i) { this.check(i); return this.a[i]; }
  set(i, x) { this.check(i); this.a[i] = x; }

  push(x) {
    if (this.n === this.cap) this.resize(2 * this.cap);
    this.a[this.n++] = x;
  }
  pop() {
    if (this.n === 0) throw new RangeError('pop from empty array');
    const x = this.a[--this.n];
    this.a[this.n] = undefined;
    if (this.cap > 1 && this.n <= this.cap / 4) this.resize(Math.max(1, Math.floor(this.cap / 2)));
    return x;
  }

  insertAt(i, x) {
    if (!Number.isInteger(i) || i < 0 || i > this.n) throw new RangeError('index ' + i);
    if (this.n === this.cap) this.resize(2 * this.cap);
    for (let k = this.n; k > i; k--) this.a[k] = this.a[k - 1];   // shift right, from the end
    this.a[i] = x;
    this.n++;
  }
  removeAt(i) {
    this.check(i);
    const x = this.a[i];
    for (let k = i; k < this.n - 1; k++) this.a[k] = this.a[k + 1]; // shift left
    this.a[--this.n] = undefined;
    if (this.cap > 1 && this.n <= this.cap / 4) this.resize(Math.max(1, Math.floor(this.cap / 2)));
    return x;
  }
}

function buildDyn(n) {
  const d = new DynArray();
  for (let i = 0; i < n; i++) d.push(i);
  return d;
}
`;

// Starter and model-solution code for the lab in lesson 2.6.

export const starter = `// A hash set of integers with OPEN ADDRESSING and LINEAR PROBING.
// Rules:
//  - this.t is an array of m cells; a cell holds a key, or EMPTY (undefined), or DEL (a tombstone).
//  - probe h(k), h(k)+1, h(k)+2, ... (mod m), with h(k) = ((a·k + b) mod p) mod m.
//  - find stops at an EMPTY cell, but NOT at a tombstone.
//  - add may reuse the first tombstone it passed, after checking that k is not further along.
//  - keep the table at most half full counting tombstones: if (n + tombs) * 2 > m after an add,
//    rebuild into a table of size 2·m (a rebuild drops all tombstones).
//  - count every cell you look at in this.probes.
//  - no JavaScript Set or Map.
const DEL = { tombstone: true };

class LinearProbeSet {
  constructor() {
    this.p = 1000003;
    this.a = 1 + Math.floor(Math.random() * (this.p - 1));
    this.b = Math.floor(Math.random() * this.p);
    this.m = 8;
    this.t = new Array(this.m);
    this.n = 0;
    this.tombs = 0;
    this.probes = 0;
  }
  h(k) { return ((this.a * k + this.b) % this.p) % this.m; }
  size() { return this.n; }

  has(k) {
    // your code here
  }
  add(k) {
    // your code here
  }
  delete(k) {
    // your code here (return true if k was present)
  }
  rebuild(m) {
    // your code here
  }
}

// For the timing experiment: the number of distinct values in A, using LinearProbeSet.
function countDistinct(A) {
  const S = new LinearProbeSet();
  for (const x of A) S.add(x);
  return S.size();
}
`;

export const solution = `const DEL = { tombstone: true };

class LinearProbeSet {
  constructor() {
    this.p = 1000003;
    this.a = 1 + Math.floor(Math.random() * (this.p - 1));
    this.b = Math.floor(Math.random() * this.p);
    this.m = 8;
    this.t = new Array(this.m);
    this.n = 0;
    this.tombs = 0;
    this.probes = 0;
  }
  h(k) { return ((this.a * k + this.b) % this.p) % this.m; }
  size() { return this.n; }

  // index of k, or -1
  locate(k) {
    for (let i = this.h(k), c = 0; c < this.m; i = (i + 1) % this.m, c++) {
      this.probes++;
      const x = this.t[i];
      if (x === undefined) return -1;          // an empty cell ends the search
      if (x === k) return i;                   // tombstones are skipped
    }
    return -1;
  }
  has(k) { return this.locate(k) >= 0; }

  add(k) {
    if (this.has(k)) return;
    let i = this.h(k);
    while (this.t[i] !== undefined && this.t[i] !== DEL) { this.probes++; i = (i + 1) % this.m; }
    this.probes++;
    if (this.t[i] === DEL) this.tombs--;       // reuse a tombstone
    this.t[i] = k;
    this.n++;
    if ((this.n + this.tombs) * 2 > this.m) this.rebuild(2 * this.m);
  }

  delete(k) {
    const i = this.locate(k);
    if (i < 0) return false;
    this.t[i] = DEL;                           // not undefined: that would break other searches
    this.n--;
    this.tombs++;
    return true;
  }

  rebuild(m) {
    const old = this.t;
    this.m = m;
    this.t = new Array(m);
    this.n = 0;
    this.tombs = 0;
    for (const x of old) if (x !== undefined && x !== DEL) {
      let i = this.h(x);
      while (this.t[i] !== undefined) i = (i + 1) % m;
      this.t[i] = x;
      this.n++;
    }
  }
}

function countDistinct(A) {
  const S = new LinearProbeSet();
  for (const x of A) S.add(x);
  return S.size();
}
`;

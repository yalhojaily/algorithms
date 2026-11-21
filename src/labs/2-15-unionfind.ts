// Starter and model-solution code for the lab in lesson 2.15.

export const starter = `// Disjoint sets on the elements 0..n−1.
// Use BOTH union by rank (or by size) AND path compression: the tests include a long chain of
// 200 000 unions, which overflows the stack or times out without them.
class UnionFind {
  constructor(n) {
    // your code here
  }

  // The representative (root) of x's set.
  find(x) { /* your code here */ }

  // Merge the sets of a and b. Return true if they were different sets, false otherwise.
  union(a, b) { /* your code here */ }

  connected(a, b) { /* your code here */ }

  // The number of disjoint sets right now.
  count() { /* your code here */ }

  // The number of elements in x's set.
  sizeOf(x) { /* your code here */ }
}

// The number of connected components of a graph with vertices 0..n−1 and the given edges [[a, b], ...].
function numComponents(n, edges) {
  // your code here
}

// grid is an array of strings of '1' (land) and '0' (water). Count the islands:
// groups of land cells joined horizontally or vertically.
function numIslands(grid) {
  // your code here
}

// logs: [[time, a, b], ...] sorted by time: at that time, a and b became friends.
// Return the earliest time at which all n people are in one group, or −1 if that never happens.
function earliestFullyConnected(n, logs) {
  // your code here
}
`;

export const solution = `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.sets = n;
  }

  find(x) {
    let r = x;
    while (this.parent[r] !== r) r = this.parent[r];
    while (this.parent[x] !== r) { const next = this.parent[x]; this.parent[x] = r; x = next; }  // path compression
    return r;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];   // union by size: small under big
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.sets--;
    return true;
  }

  connected(a, b) { return this.find(a) === this.find(b); }

  count() { return this.sets; }

  sizeOf(x) { return this.size[this.find(x)]; }
}

function numComponents(n, edges) {
  const U = new UnionFind(n);
  for (const [a, b] of edges) U.union(a, b);
  return U.count();
}

function numIslands(grid) {
  const R = grid.length, C = R ? grid[0].length : 0;
  const U = new UnionFind(R * C);
  let water = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (grid[r][c] !== '1') { water++; continue; }
    if (r + 1 < R && grid[r + 1][c] === '1') U.union(r * C + c, (r + 1) * C + c);
    if (c + 1 < C && grid[r][c + 1] === '1') U.union(r * C + c, r * C + c + 1);
  }
  return U.count() - water;   // every water cell is its own singleton set
}

function earliestFullyConnected(n, logs) {
  const U = new UnionFind(n);
  if (n <= 1) return logs.length ? logs[0][0] : -1;
  for (const [t, a, b] of logs) if (U.union(a, b) && U.count() === 1) return t;
  return -1;
}
`;

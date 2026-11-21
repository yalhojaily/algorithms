// Starter and model-solution code for the lab in lesson 3.3.

export const starter = `// Intervals are [s, f] pairs with s < f, half-open: [1, 3] and [3, 5] do NOT overlap.

// 1) Interval scheduling: return a largest set of pairwise non-overlapping intervals
//    (any optimal set; the intervals themselves, in any order). O(n log n).
function maxNonOverlapping(I) {
  // your code here
}

// 2) Interval partitioning: the minimum number of rooms so that no room has two overlapping intervals.
function minRooms(I) {
  // your code here
}

// 3) Return an array room where room[i] is the room (0, 1, 2, ...) of interval I[i],
//    using exactly minRooms(I) rooms. Hint: sort by start, and keep a min-heap of
//    [end time, room] for the busy rooms (or scan the rooms when n is small).
function assignRooms(I) {
  // your code here
}

// 4) Stabbing: the minimum number of points (times) such that every interval [s, f) contains one.
//    A point p stabs [s, f) when s ≤ p < f.
function minStabbingPoints(I) {
  // your code here
}
`;

export const solution = `function maxNonOverlapping(I) {
  const S = I.slice().sort((a, b) => a[1] - b[1]);     // earliest finish first
  const out = [];
  let end = -Infinity;
  for (const iv of S) if (iv[0] >= end) { out.push(iv); end = iv[1]; }
  return out;
}

function minRooms(I) {
  // sweep: +1 at each start, −1 at each end; ends before starts at equal times
  const ev = [];
  for (const [s, f] of I) { ev.push([s, 1]); ev.push([f, -1]); }
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let cur = 0, best = 0;
  for (const [, d] of ev) { cur += d; best = Math.max(best, cur); }
  return best;
}

function assignRooms(I) {
  const order = I.map((_, i) => i).sort((a, b) => I[a][0] - I[b][0]);
  const room = new Array(I.length);
  const heap = [];                                       // min-heap of [end, room]
  const less = (a, b) => a[0] < b[0];
  const push = (x) => { heap.push(x); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } } return top; };
  let rooms = 0;
  for (const i of order) {
    let r;
    if (heap.length && heap[0][0] <= I[i][0]) r = pop()[1];   // a room that is free by now
    else r = rooms++;
    room[i] = r;
    push([I[i][1], r]);
  }
  return room;
}

function minStabbingPoints(I) {
  // earliest finish again: the last moment inside the first-ending interval, f − ε, stabs as many as possible
  const S = I.slice().sort((a, b) => a[1] - b[1]);
  let count = 0, p = -Infinity;
  for (const [s, f] of S) if (!(s <= p && p < f)) { count++; p = f - 1e-9; }
  return count;
}
`;

// Starter and model-solution code for the lab in lesson 3.2.

const helpers = `// ---- helpers (given): numbers are decimal strings without leading zeros, "0" for zero ----
function trim(a) { const s = a.replace(/^0+/, ''); return s === '' ? '0' : s; }
function add(a, b) {
  let i = a.length - 1, j = b.length - 1, carry = 0, out = [];
  while (i >= 0 || j >= 0 || carry) {
    const s = (i >= 0 ? +a[i--] : 0) + (j >= 0 ? +b[j--] : 0) + carry;
    out.push(s % 10); carry = s >= 10 ? 1 : 0;
  }
  return trim(out.reverse().join(''));
}
function sub(a, b) {            // a − b, assuming a ≥ b
  let i = a.length - 1, j = b.length - 1, borrow = 0, out = [];
  while (i >= 0) {
    let s = +a[i--] - (j >= 0 ? +b[j--] : 0) - borrow;
    borrow = s < 0 ? 1 : 0; if (s < 0) s += 10;
    out.push(s);
  }
  return trim(out.reverse().join(''));
}
function shift(a, k) { return a === '0' ? '0' : a + '0'.repeat(k); }   // a · 10^k
function schoolMultiply(a, b) {   // Θ(len(a) · len(b))
  const r = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
    const s = r[i + j + 1] + +a[i] * +b[j];
    r[i + j + 1] = s % 10; r[i + j] += Math.floor(s / 10);
  }
  return trim(r.join(''));
}
// -------------------------------------------------------------------------------------------
`;

export const starter = helpers + `
// 1) Karatsuba multiplication of two decimal strings. Return the product as a decimal string.
//    Split at m = ⌊n/2⌋ digits from the right: x = x1·10^m + x0, y = y1·10^m + y0.
//    Three recursive products: z2 = x1·y1, z0 = x0·y0, z1 = (x1 + x0)(y1 + y0) − z2 − z0.
//    For short numbers (say n ≤ 32 digits) call schoolMultiply: it is faster there.
function karatsuba(x, y) {
  // your code here
}

// 2) Closest pair: P is an array of points [x, y]. Return the smallest distance between two of them.
//    It must handle 100 000 points: O(n log n) or O(n log² n), not O(n²).
function closestPair(P) {
  // your code here
}
`;

export const solution = helpers + `
function karatsuba(x, y) {
  const n = Math.max(x.length, y.length);
  if (n <= 32) return schoolMultiply(x, y);
  const m = n >> 1;
  const split = (a) => a.length > m ? [trim(a.slice(0, a.length - m)), trim(a.slice(a.length - m))] : ['0', trim(a)];
  const [x1, x0] = split(x), [y1, y0] = split(y);
  const z2 = karatsuba(x1, y1);
  const z0 = karatsuba(x0, y0);
  const z1 = sub(sub(karatsuba(add(x1, x0), add(y1, y0)), z2), z0);
  return add(add(shift(z2, 2 * m), shift(z1, m)), z0);
}

function closestPair(P) {
  const S = P.slice().sort((a, b) => a[0] - b[0]);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  // rec returns the points of S[lo..hi) sorted by y (merge sort along the way) and the best distance
  const rec = (lo, hi) => {
    if (hi - lo <= 3) {
      let d = Infinity;
      for (let i = lo; i < hi; i++) for (let j = i + 1; j < hi; j++) d = Math.min(d, dist(S[i], S[j]));
      return { byY: S.slice(lo, hi).sort((a, b) => a[1] - b[1]), d };
    }
    const mid = (lo + hi) >> 1, midX = S[mid][0];
    const L = rec(lo, mid), R = rec(mid, hi);
    let d = Math.min(L.d, R.d);
    const byY = [];                                   // merge the two y-sorted lists: O(n)
    let i = 0, j = 0;
    while (i < L.byY.length || j < R.byY.length)
      byY.push(j >= R.byY.length || (i < L.byY.length && L.byY[i][1] <= R.byY[j][1]) ? L.byY[i++] : R.byY[j++]);
    const strip = byY.filter((p) => Math.abs(p[0] - midX) < d);
    for (let a = 0; a < strip.length; a++)
      for (let b = a + 1; b < strip.length && strip[b][1] - strip[a][1] < d; b++)
        d = Math.min(d, dist(strip[a], strip[b]));
    return { byY, d };
  };
  return rec(0, S.length).d;
}
`;

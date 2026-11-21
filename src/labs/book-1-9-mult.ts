// Starter and model-solution code for the lab in book section 1.9.

const helpers = `// ---- helpers (given): non-negative numbers as decimal strings, "0" for zero ----
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
function digitTimes(a, d) {      // a · d for a single digit d
  let carry = 0, out = [];
  for (let i = a.length - 1; i >= 0; i--) { const s = +a[i] * d + carry; out.push(s % 10); carry = Math.floor(s / 10); }
  if (carry) out.push(carry);
  return trim(out.reverse().join(''));
}
// Split a at m digits from the right: [high, low] with a = high · 10^m + low.
function split(a, m) { return a.length > m ? [trim(a.slice(0, a.length - m)), trim(a.slice(a.length - m))] : ['0', trim(a)]; }
// -------------------------------------------------------------------------------------------
`;

export const starter = helpers + `
// 1) SplitMultiply from the book: four recursive products. Base case: one of the numbers has one digit
//    (use digitTimes). Θ(n²): it multiplies every digit by every digit, just like school.
function splitMultiply(x, y) {
  // your code here
}

// 2) Karatsuba: three recursive products. Use the identity
//      (a + b)(c + d) − ac − bd = bc + ad
//    (the book uses (a − b)(c − d) instead, but that needs negative numbers; this is Karatsuba's original form).
//    For short numbers (say ≤ 32 digits) fall back to splitMultiply.
function karatsuba(x, y) {
  // your code here
}
`;

export const solution = helpers + `
function splitMultiply(x, y) {
  if (x.length === 1) return digitTimes(y, +x);
  if (y.length === 1) return digitTimes(x, +y);
  const m = Math.ceil(Math.max(x.length, y.length) / 2);
  const [a, b] = split(x, m), [c, d] = split(y, m);
  const e = splitMultiply(a, c), f = splitMultiply(b, d);
  const g = splitMultiply(b, c), h = splitMultiply(a, d);
  return add(add(shift(e, 2 * m), shift(add(g, h), m)), f);
}

function karatsuba(x, y) {
  if (Math.max(x.length, y.length) <= 32) return splitMultiply(x, y);
  const m = Math.ceil(Math.max(x.length, y.length) / 2);
  const [a, b] = split(x, m), [c, d] = split(y, m);
  const e = karatsuba(a, c);                         // ac
  const f = karatsuba(b, d);                         // bd
  const g = karatsuba(add(a, b), add(c, d));         // (a + b)(c + d)
  return add(add(shift(e, 2 * m), shift(sub(sub(g, e), f), m)), f);
}
`;

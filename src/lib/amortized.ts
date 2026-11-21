// Three classic structures for lesson 2.2, each with its actual cost per operation and a potential function.

export interface AmStep { op: string; cost: number; phi: number; amort: number; state: string }

// ---------- Binary counter ----------
export const BITS = 8;

export function counterRun(ops: ('inc' | 'dec')[], bits = BITS) {
  let x = 0;
  const mask = 2 ** bits - 1;
  const ones = (v: number) => v.toString(2).split('').filter((c) => c === '1').length;
  const out: AmStep[] = [];
  for (const op of ops) {
    const before = x;
    x = op === 'inc' ? (x + 1) & mask : (x - 1 + mask + 1) & mask;
    const flips = ones(before ^ x);
    const phiB = ones(before), phiA = ones(x);
    out.push({ op: op === 'inc' ? '+1' : '−1', cost: flips, phi: phiA, amort: flips + phiA - phiB, state: x.toString(2).padStart(bits, '0') });
  }
  return out;
}

// ---------- Stack with MULTIPOP ----------
export function stackRun(ops: { op: 'push' | 'pop' | 'multipop'; k?: number }[]) {
  let s = 0;
  const out: AmStep[] = [];
  for (const o of ops) {
    const before = s;
    let cost = 0;
    if (o.op === 'push') { s++; cost = 1; }
    else if (o.op === 'pop') { if (s > 0) { s--; cost = 1; } }
    else { const m = Math.min(o.k ?? 1, s); s -= m; cost = m; }
    out.push({ op: o.op === 'multipop' ? `multipop(${o.k})` : o.op, cost, phi: s, amort: cost + s - before, state: String(s) });
  }
  return out;
}

// ---------- Dynamic array (doubling, no shrinking) with Φ = max(0, 2n − cap) ----------
export function arrayRun(pushes: number) {
  let n = 0, cap = 1;
  const phiOf = (n: number, c: number) => Math.max(0, 2 * n - c);
  const out: AmStep[] = [];
  for (let t = 0; t < pushes; t++) {
    const pb = phiOf(n, cap);
    let cost = 1;
    if (n === cap) { cost += n; cap *= 2; }
    n++;
    const pa = phiOf(n, cap);
    out.push({ op: 'push', cost, phi: pa, amort: cost + pa - pb, state: `${n}/${cap}` });
  }
  return out;
}

// Recursion trees and the master theorem, for lessons 1.7 and 1.8.
// A node of size m costs f(m); size-1 nodes are leaves. T(n) is the sum over the whole tree.

export interface Recurrence {
  key: string;
  tex: string;
  /** Where it comes from. */
  origin: string;
  a: number;
  /** 'div': children have size n/b. 'sub': children have size n − 1. */
  kind: 'div' | 'sub';
  b: number;
  f: (m: number) => number;
  fTex: string;
  /** Exact solution for the sizes offered (powers of b, or any n ≥ 1). */
  exact: (n: number) => number;
  exactTex: string;
  theta: string;
  sizes: number[];
}

const pow2 = (k1: number, k2: number) => Array.from({ length: k2 - k1 + 1 }, (_, i) => 2 ** (k1 + i));
const upto = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const lg = Math.log2;

export const RECURRENCES: Recurrence[] = [
  { key: 'bs', tex: 'T(n) = T(n/2) + 1', origin: 'البحث الثنائي', a: 1, kind: 'div', b: 2, f: () => 1, fTex: '1', exact: (n) => lg(n) + 1, exactTex: '\\log_2 n + 1', theta: '\\Theta(\\log n)', sizes: pow2(0, 10) },
  { key: 'ms', tex: 'T(n) = 2T(n/2) + n', origin: 'الترتيب بالدمج', a: 2, kind: 'div', b: 2, f: (m) => m, fTex: 'n', exact: (n) => n * lg(n) + n, exactTex: 'n\\log_2 n + n', theta: '\\Theta(n \\log n)', sizes: pow2(0, 10) },
  { key: 'tree', tex: 'T(n) = 2T(n/2) + 1', origin: 'المرور على شجرة متوازنة', a: 2, kind: 'div', b: 2, f: () => 1, fTex: '1', exact: (n) => 2 * n - 1, exactTex: '2n - 1', theta: '\\Theta(n)', sizes: pow2(0, 10) },
  { key: 'half', tex: 'T(n) = T(n/2) + n', origin: 'نصف واحد مع عمل خطي (كالاختيار السريع)', a: 1, kind: 'div', b: 2, f: (m) => m, fTex: 'n', exact: (n) => 2 * n - 1, exactTex: '2n - 1', theta: '\\Theta(n)', sizes: pow2(0, 10) },
  { key: 'kar', tex: 'T(n) = 3T(n/2) + n', origin: 'ضرب Karatsuba', a: 3, kind: 'div', b: 2, f: (m) => m, fTex: 'n', exact: (n) => 3 * n ** lg(3) - 2 * n, exactTex: '3n^{\\log_2 3} - 2n', theta: '\\Theta(n^{\\log_2 3}) \\approx \\Theta(n^{1.585})', sizes: pow2(0, 9) },
  { key: 'q4', tex: 'T(n) = 4T(n/2) + n', origin: 'ضرب الأعداد بالتقسيم الساذج', a: 4, kind: 'div', b: 2, f: (m) => m, fTex: 'n', exact: (n) => 2 * n * n - n, exactTex: '2n^2 - n', theta: '\\Theta(n^2)', sizes: pow2(0, 8) },
  { key: 'sq', tex: 'T(n) = 2T(n/2) + n^2', origin: 'عمل تربيعي عند كل عقدة', a: 2, kind: 'div', b: 2, f: (m) => m * m, fTex: 'n^2', exact: (n) => 2 * n * n - n, exactTex: '2n^2 - n', theta: '\\Theta(n^2)', sizes: pow2(0, 10) },
  { key: 'lin', tex: 'T(n) = T(n-1) + 1', origin: 'المضروب، RSUM', a: 1, kind: 'sub', b: 1, f: () => 1, fTex: '1', exact: (n) => n, exactTex: 'n', theta: '\\Theta(n)', sizes: upto(1, 12) },
  { key: 'ins', tex: 'T(n) = T(n-1) + n', origin: 'الإدراج والاختيار (أسوأ حالة)', a: 1, kind: 'sub', b: 1, f: (m) => m, fTex: 'n', exact: (n) => (n * (n + 1)) / 2, exactTex: '\\tfrac{n(n+1)}{2}', theta: '\\Theta(n^2)', sizes: upto(1, 12) },
  { key: 'hanoi', tex: 'T(n) = 2T(n-1) + 1', origin: 'أبراج هانوي', a: 2, kind: 'sub', b: 1, f: () => 1, fTex: '1', exact: (n) => 2 ** n - 1, exactTex: '2^n - 1', theta: '\\Theta(2^n)', sizes: upto(1, 12) },
];

export interface Level { depth: number; nodes: number; size: number; perNode: number; total: number }

/** Levels of the recursion tree for size n (every node on a level has the same size). */
export function levels(r: Recurrence, n: number): Level[] {
  const out: Level[] = [];
  let size = n, nodes = 1, depth = 0;
  for (;;) {
    out.push({ depth, nodes, size, perNode: r.f(size), total: nodes * r.f(size) });
    if (size <= 1) break;
    size = r.kind === 'div' ? size / r.b : size - 1;
    nodes *= r.a;
    depth++;
  }
  return out;
}

/** T(n) straight from the recurrence, with T(1) = f(1). */
export function direct(r: Recurrence, n: number): number {
  if (n <= 1) return r.f(1);
  return r.a * direct(r, r.kind === 'div' ? n / r.b : n - 1) + r.f(n);
}

// ---------- Master theorem: T(n) = a T(n/b) + n^d (log n)^k ----------

export type MasterCase = 1 | 2 | 3;

export interface MasterResult {
  crit: number;        // log_b a
  case: MasterCase;
  ratio: number;       // a / b^d: how level sums change going down
  thetaTex: string;
}

const fmtExp = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(3));
const nPow = (e: number) => (Math.abs(e) < 1e-9 ? '1' : Math.abs(e - 1) < 1e-9 ? 'n' : `n^{${fmtExp(e)}}`);
const logPow = (k: number) => (k === 0 ? '' : k === 1 ? '\\log n' : `\\log^{${k}} n`);

export function master(a: number, b: number, d: number, k = 0): MasterResult {
  const crit = Math.log(a) / Math.log(b);
  const ratio = a / b ** d;
  if (Math.abs(d - crit) < 1e-9) {
    const body = [nPow(d), logPow(k + 1)].filter((s) => s && s !== '1').join(' ');
    return { crit, case: 2, ratio, thetaTex: `\\Theta(${body || '\\log n'})` };
  }
  if (d < crit) return { crit, case: 1, ratio, thetaTex: `\\Theta(${nPow(crit)}${Math.abs(crit - Math.round(crit)) > 1e-9 ? '' : ''})` };
  const body = [nPow(d), logPow(k)].filter((s) => s && s !== '1').join(' ');
  return { crit, case: 3, ratio, thetaTex: `\\Theta(${body || '1'})` };
}

/** Exact T(b^j) with T(1) = 1 and f(m) = m^d (log₂ m)^k (f(1) treated as 1 so leaves cost 1). */
export function masterExact(a: number, b: number, d: number, k: number, j: number): number {
  let t = 1;
  for (let i = 1; i <= j; i++) {
    const m = b ** i;
    t = a * t + m ** d * Math.log2(m) ** k;
  }
  return t;
}

/** The predicted growth g(n) for comparison: n^crit, n^d log^(k+1) n, or n^d log^k n. */
export function masterGrowth(a: number, b: number, d: number, k: number, n: number): number {
  const r = master(a, b, d, k);
  const L = Math.log2(n);
  if (r.case === 1) return n ** r.crit;
  if (r.case === 2) return n ** d * L ** (k + 1);
  return n ** d * L ** k;
}

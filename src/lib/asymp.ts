// Functions and witness checking for lesson 1.4 (asymptotic notation).

export interface GFn {
  key: string;
  tex: string;
  label: string;
  f: (n: number) => number;
  /** Growth class, compared lexicographically: [exponential base exponent, polynomial degree, log power]. */
  rank: [number, number, number];
}

const lg = (n: number) => Math.log2(Math.max(n, 1));

export const FNS: GFn[] = [
  { key: 'c', tex: '1000', label: '1000', f: () => 1000, rank: [0, 0, 0] },
  { key: 'log', tex: '\\log_2 n', label: 'log₂ n', f: lg, rank: [0, 0, 1] },
  { key: 'sqrt', tex: '\\sqrt{n}', label: '√n', f: Math.sqrt, rank: [0, 0.5, 0] },
  { key: 'n', tex: 'n', label: 'n', f: (n) => n, rank: [0, 1, 0] },
  { key: '100n', tex: '100n', label: '100n', f: (n) => 100 * n, rank: [0, 1, 0] },
  { key: 'nlog', tex: 'n \\log_2 n', label: 'n log₂ n', f: (n) => n * lg(n), rank: [0, 1, 1] },
  { key: 'n2', tex: 'n^2', label: 'n²', f: (n) => n * n, rank: [0, 2, 0] },
  { key: 'n2s', tex: 'n^2 / 100', label: 'n²/100', f: (n) => (n * n) / 100, rank: [0, 2, 0] },
  { key: 'poly', tex: '3n^2 + 10n + 50', label: '3n² + 10n + 50', f: (n) => 3 * n * n + 10 * n + 50, rank: [0, 2, 0] },
  { key: 'n3', tex: 'n^3', label: 'n³', f: (n) => n ** 3, rank: [0, 3, 0] },
  { key: 'exp', tex: '2^n', label: '2ⁿ', f: (n) => 2 ** n, rank: [1, 0, 0] },
];

export type Rel = 'O' | 'Omega' | 'Theta';

/** -1 if f grows strictly slower than g, 0 if same class, 1 if faster. */
export function compareGrowth(f: GFn, g: GFn): -1 | 0 | 1 {
  for (let i = 0; i < 3; i++) {
    if (f.rank[i] < g.rank[i]) return -1;
    if (f.rank[i] > g.rank[i]) return 1;
  }
  return 0;
}

/** Is f = O(g) / Ω(g) / Θ(g) really true? */
export function truth(f: GFn, g: GFn, rel: Rel): boolean {
  const c = compareGrowth(f, g);
  return rel === 'O' ? c <= 0 : rel === 'Omega' ? c >= 0 : c === 0;
}

export interface Witness { c1: number; c2: number; n0: number }

/** Does the inequality hold at n? For O: f ≤ c1 g. For Ω: f ≥ c1 g. For Θ: c1 g ≤ f ≤ c2 g. */
export function holdsAt(f: GFn, g: GFn, rel: Rel, w: Witness, n: number): boolean {
  const fv = f.f(n), gv = g.f(n);
  const eps = 1e-9 * Math.max(1, Math.abs(fv));
  if (rel === 'O') return fv <= w.c1 * gv + eps;
  if (rel === 'Omega') return fv + eps >= w.c1 * gv;
  return w.c1 * gv <= fv + eps && fv <= w.c2 * gv + eps;
}

/** First n ≥ n0 where the witness fails: checks every integer up to `dense`, then doubling up to 2^60. */
export function firstFailure(f: GFn, g: GFn, rel: Rel, w: Witness, dense = 5000): number | null {
  const start = Math.max(1, Math.ceil(w.n0));
  for (let n = start; n <= Math.max(dense, start); n++) if (!holdsAt(f, g, rel, w, n)) return n;
  for (let n = Math.max(dense, start) * 2; n <= 2 ** 60; n *= 2) {
    if (!holdsAt(f, g, rel, w, n)) {
      // narrow down between n/2 and n
      let lo = n / 2, hi = n;
      while (hi - lo > 1) { const m = Math.floor((lo + hi) / 2); if (holdsAt(f, g, rel, w, m)) lo = m; else hi = m; }
      return hi;
    }
  }
  return null;
}

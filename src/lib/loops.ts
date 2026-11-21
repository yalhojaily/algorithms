// Loop patterns whose running time is a sum (lesson 0.8).

export type PatternKey = 'tri' | 'sq' | 'dbl' | 'geo' | 'harm';

export interface LoopPattern {
  key: PatternKey;
  label: string;
  code: string[];
  /** The work done by each outer iteration, in order. */
  bars: (n: number) => { label: string; h: number }[];
  sumTex: string;
  closed: (n: number) => string;
  exact: (n: number) => number;
  theta: string;
}

const H = (n: number) => { let s = 0; for (let i = 1; i <= n; i++) s += 1 / i; return s; };

export const PATTERNS: LoopPattern[] = [
  {
    key: 'tri', label: 'مثلث', theta: '\\Theta(n^2)',
    code: ['for i ← 1 to n:', '  for j ← 1 to i:', '    work()'],
    bars: (n) => Array.from({ length: n }, (_, k) => ({ label: `i=${k + 1}`, h: k + 1 })),
    sumTex: '\\sum_{i=1}^{n} i', closed: (n) => `\\frac{n(n+1)}{2} = ${(n * (n + 1)) / 2}`, exact: (n) => (n * (n + 1)) / 2,
  },
  {
    key: 'sq', label: 'مربع', theta: '\\Theta(n^2)',
    code: ['for i ← 1 to n:', '  for j ← 1 to n:', '    work()'],
    bars: (n) => Array.from({ length: n }, (_, k) => ({ label: `i=${k + 1}`, h: n })),
    sumTex: '\\sum_{i=1}^{n} n', closed: (n) => `n^2 = ${n * n}`, exact: (n) => n * n,
  },
  {
    key: 'dbl', label: 'مضاعفة', theta: '\\Theta(\\log n)',
    code: ['i ← 1', 'while i < n:', '  i ← 2 · i;  work()'],
    bars: (n) => { const out = []; for (let i = 1; i < n; i *= 2) out.push({ label: `i=${i}`, h: 1 }); return out; },
    sumTex: '\\sum_{k=0}^{\\lceil \\log_2 n \\rceil - 1} 1', closed: (n) => `\\lceil \\log_2 ${n} \\rceil = ${Math.ceil(Math.log2(n))}`, exact: (n) => Math.ceil(Math.log2(n)),
  },
  {
    key: 'geo', label: 'تنصيف', theta: '\\Theta(n)',
    code: ['len ← n', 'while len ≥ 1:', '  for j ← 1 to len: work()', '  len ← ⌊len / 2⌋'],
    bars: (n) => { const out = []; for (let L = n; L >= 1; L = Math.floor(L / 2)) out.push({ label: `len=${L}`, h: L }); return out; },
    sumTex: 'n + \\tfrac{n}{2} + \\tfrac{n}{4} + \\cdots', closed: (n) => { let s = 0; for (let L = n; L >= 1; L = Math.floor(L / 2)) s += L; return `< 2n = ${2 * n} \\quad (\\text{exact: } ${s})`; },
    exact: (n) => { let s = 0; for (let L = n; L >= 1; L = Math.floor(L / 2)) s += L; return s; },
  },
  {
    key: 'harm', label: 'توافقي', theta: '\\Theta(n \\log n)',
    code: ['for i ← 1 to n:', '  for j ← i to n step i:', '    work()'],
    bars: (n) => Array.from({ length: n }, (_, k) => ({ label: `i=${k + 1}`, h: Math.floor(n / (k + 1)) })),
    sumTex: '\\sum_{i=1}^{n} \\left\\lfloor \\tfrac{n}{i} \\right\\rfloor', closed: (n) => `\\approx n H_n \\approx ${(n * H(n)).toFixed(1)}`,
    exact: (n) => { let s = 0; for (let i = 1; i <= n; i++) s += Math.floor(n / i); return s; },
  },
];

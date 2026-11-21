// Line-by-line cost tables for lesson 1.3. Each algorithm is run with a counter per line,
// and each line also carries a closed-form count, so the page can show both side by side.

import { mulberry32 } from './montecarlo';

export interface CostLine {
  code: string;
  /** How many times the line runs, as TeX. Empty for the header line. */
  tex: string;
  /** The same count as a function of n; null when it depends on the data. */
  f: ((n: number) => number) | null;
}

export interface Term { tex: string; f: (n: number) => number }

export interface CostAlgo {
  key: string;
  label: string;
  /** What n means for this algorithm. */
  sizeNote: string;
  sizes: number[];
  lines: CostLine[];
  /** T(n) as TeX, and its terms (for the "who dominates" bars). */
  total: string;
  terms: Term[];
  /** Extra memory, beyond the input. */
  space: { tex: string; f: (n: number) => number; note: string };
  /** Run on an input of size n: count per line (index = line index), and peak extra memory cells. */
  measure: (n: number, seed?: number) => { counts: number[]; space: number };
}

const C3 = (n: number) => (n * (n - 1) * (n - 2)) / 6;
const arr = (n: number, seed: number) => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => 1 + Math.floor(r() * 50)); // all positive: no zero-sum pairs
};
const upTo = (m: number) => Array.from({ length: m + 1 }, (_, i) => i);

export const COST_ALGOS: CostAlgo[] = [
  {
    key: 'sum', label: 'المجموع', sizeNote: 'n عدد عناصر المصفوفة', sizes: upTo(40),
    lines: [
      { code: 'SUM(A, n):', tex: '', f: null },
      { code: '  s ← 0', tex: '1', f: () => 1 },
      { code: '  for i ← 0 to n − 1:', tex: 'n + 1', f: (n) => n + 1 },
      { code: '    s ← s + A[i]', tex: 'n', f: (n) => n },
      { code: '  return s', tex: '1', f: () => 1 },
    ],
    total: 'T(n) = 2n + 3',
    terms: [{ tex: '2n', f: (n) => 2 * n }, { tex: '3', f: () => 3 }],
    space: { tex: '2', f: () => 2, note: 'المتغيران s وi فقط، مهما كان n.' },
    measure(n, seed = 1) {
      const A = arr(n, seed), c = [0, 0, 0, 0, 0];
      let s = 0; c[1]++;
      for (let i = 0; ; i++) { c[2]++; if (i > n - 1) break; s += A[i]; c[3]++; }
      c[4]++;
      return { counts: c, space: 2 };
    },
  },
  {
    key: 'prefix', label: 'المجاميع التراكمية', sizeNote: 'n عدد عناصر المصفوفة', sizes: upTo(40),
    lines: [
      { code: 'PREFIX(A, n):', tex: '', f: null },
      { code: '  P ← array[0..n];  P[0] ← 0', tex: '1', f: () => 1 },
      { code: '  for i ← 1 to n:', tex: 'n + 1', f: (n) => n + 1 },
      { code: '    P[i] ← P[i−1] + A[i−1]', tex: 'n', f: (n) => n },
      { code: '  return P', tex: '1', f: () => 1 },
    ],
    total: 'T(n) = 2n + 3',
    terms: [{ tex: '2n', f: (n) => 2 * n }, { tex: '3', f: () => 3 }],
    space: { tex: 'n + 2', f: (n) => n + 2, note: 'المصفوفة الجديدة P فيها n + 1 خلية، ومعها المتغير i.' },
    measure(n, seed = 1) {
      const A = arr(n, seed), c = [0, 0, 0, 0, 0];
      const P = new Array(n + 1); P[0] = 0; c[1]++;
      for (let i = 1; ; i++) { c[2]++; if (i > n) break; P[i] = P[i - 1] + A[i - 1]; c[3]++; }
      c[4]++;
      return { counts: c, space: n + 2 };
    },
  },
  {
    key: 'rev', label: 'العكس في المكان', sizeNote: 'n عدد عناصر المصفوفة', sizes: upTo(40),
    lines: [
      { code: 'REVERSE(A, n):', tex: '', f: null },
      { code: '  i ← 0;  j ← n − 1', tex: '1', f: () => 1 },
      { code: '  while i < j:', tex: '\\lfloor n/2 \\rfloor + 1', f: (n) => Math.floor(n / 2) + 1 },
      { code: '    swap A[i], A[j]', tex: '\\lfloor n/2 \\rfloor', f: (n) => Math.floor(n / 2) },
      { code: '    i ← i + 1;  j ← j − 1', tex: '\\lfloor n/2 \\rfloor', f: (n) => Math.floor(n / 2) },
    ],
    total: 'T(n) = 3\\lfloor n/2 \\rfloor + 2',
    terms: [{ tex: '\\tfrac{3}{2}n', f: (n) => 1.5 * n }, { tex: '2', f: () => 2 }],
    space: { tex: '3', f: () => 3, note: 'i وj، وخلية مؤقتة للتبديل. المصفوفة تُعكس في مكانها.' },
    measure(n, seed = 1) {
      const A = arr(n, seed), c = [0, 0, 0, 0, 0];
      let i = 0, j = n - 1; c[1]++;
      for (;;) { c[2]++; if (!(i < j)) break; const t = A[i]; A[i] = A[j]; A[j] = t; c[3]++; i++; j--; c[4]++; }
      return { counts: c, space: 3 };
    },
  },
  {
    key: 'rsum', label: 'المجموع بالاستدعاء الذاتي', sizeNote: 'n عدد عناصر المصفوفة', sizes: upTo(40),
    lines: [
      { code: 'RSUM(A, n):', tex: '', f: null },
      { code: '  if n = 0:', tex: 'n + 1', f: (n) => n + 1 },
      { code: '    return 0', tex: '1', f: () => 1 },
      { code: '  return RSUM(A, n − 1) + A[n − 1]', tex: 'n', f: (n) => n },
    ],
    total: 'T(n) = 2n + 2',
    terms: [{ tex: '2n', f: (n) => 2 * n }, { tex: '2', f: () => 2 }],
    space: { tex: 'n + 1', f: (n) => n + 1, note: 'لا متغيرات إضافية ظاهرة، لكن كل استدعاء ينتظر في مكدس الاستدعاءات: n + 1 إطارًا في الوقت نفسه.' },
    measure(n, seed = 1) {
      const A = arr(n, seed), c = [0, 0, 0, 0];
      let depth = 0, peak = 0;
      const rs = (m: number): number => {
        depth++; peak = Math.max(peak, depth);
        c[1]++;
        let v: number;
        if (m === 0) { c[2]++; v = 0; } else { c[3]++; v = rs(m - 1) + A[m - 1]; }
        depth--;
        return v;
      };
      rs(n);
      return { counts: c, space: peak };
    },
  },
  {
    key: 'pairs', label: 'الأزواج', sizeNote: 'n عدد عناصر المصفوفة', sizes: upTo(40),
    lines: [
      { code: 'ZERO-PAIRS(A, n):', tex: '', f: null },
      { code: '  c ← 0', tex: '1', f: () => 1 },
      { code: '  for i ← 0 to n − 1:', tex: 'n + 1', f: (n) => n + 1 },
      { code: '    for j ← i + 1 to n − 1:', tex: '\\tfrac{n(n+1)}{2}', f: (n) => (n * (n + 1)) / 2 },
      { code: '      if A[i] + A[j] = 0:', tex: '\\tfrac{n(n-1)}{2}', f: (n) => (n * (n - 1)) / 2 },
      { code: '        c ← c + 1', tex: 'k', f: null },
      { code: '  return c', tex: '1', f: () => 1 },
    ],
    total: 'T(n) = n^2 + n + 3 + k',
    terms: [{ tex: 'n^2', f: (n) => n * n }, { tex: 'n', f: (n) => n }, { tex: '3', f: () => 3 }],
    space: { tex: '3', f: () => 3, note: 'c وi وj.' },
    measure(n, seed = 1) {
      const A = arr(n, seed), c = [0, 0, 0, 0, 0, 0, 0];
      let k = 0; c[1]++;
      for (let i = 0; ; i++) {
        c[2]++; if (i > n - 1) break;
        for (let j = i + 1; ; j++) { c[3]++; if (j > n - 1) break; c[4]++; if (A[i] + A[j] === 0) { k++; c[5]++; } }
      }
      c[6]++;
      return { counts: c, space: 3 };
    },
  },
  {
    key: 'triples', label: 'الثلاثيات', sizeNote: 'n عدد عناصر المصفوفة', sizes: upTo(30),
    lines: [
      { code: 'ZERO-TRIPLES(A, n):', tex: '', f: null },
      { code: '  c ← 0', tex: '1', f: () => 1 },
      { code: '  for i ← 0 to n − 1:', tex: 'n + 1', f: (n) => n + 1 },
      { code: '    for j ← i + 1 to n − 1:', tex: '\\tfrac{n(n+1)}{2}', f: (n) => (n * (n + 1)) / 2 },
      { code: '      for k ← j + 1 to n − 1:', tex: '\\binom{n+1}{3}', f: (n) => C3(n + 1) },
      { code: '        if A[i] + A[j] + A[k] = 0:', tex: '\\binom{n}{3}', f: (n) => C3(n) },
      { code: '          c ← c + 1', tex: 'k', f: null },
      { code: '  return c', tex: '1', f: () => 1 },
    ],
    total: 'T(n) = \\tfrac{1}{3}n^3 + \\tfrac{5}{3}n + 3 + k',
    terms: [{ tex: '\\tfrac{1}{3}n^3', f: (n) => n ** 3 / 3 }, { tex: '\\tfrac{5}{3}n', f: (n) => (5 * n) / 3 }, { tex: '3', f: () => 3 }],
    space: { tex: '4', f: () => 4, note: 'c وi وj وk.' },
    measure(n, seed = 1) {
      const A = arr(n, seed), c = [0, 0, 0, 0, 0, 0, 0, 0];
      c[1]++;
      for (let i = 0; ; i++) {
        c[2]++; if (i > n - 1) break;
        for (let j = i + 1; ; j++) {
          c[3]++; if (j > n - 1) break;
          for (let k = j + 1; ; k++) { c[4]++; if (k > n - 1) break; c[5]++; if (A[i] + A[j] + A[k] === 0) c[6]++; }
        }
      }
      c[7]++;
      return { counts: c, space: 4 };
    },
  },
  {
    key: 'bits', label: 'عدد الأرقام الثنائية', sizeNote: 'المدخل عدد واحد N، والجدول بدلالة b = عدد أرقامه الثنائية', sizes: [1, 2, 3, 4, 7, 8, 15, 16, 100, 1000, 10 ** 4, 10 ** 6, 10 ** 9],
    lines: [
      { code: 'BITS(N):', tex: '', f: null },
      { code: '  c ← 0', tex: '1', f: () => 1 },
      { code: '  while N > 0:', tex: 'b + 1', f: (N) => Math.floor(Math.log2(N)) + 2 },
      { code: '    N ← ⌊N / 2⌋', tex: 'b', f: (N) => Math.floor(Math.log2(N)) + 1 },
      { code: '    c ← c + 1', tex: 'b', f: (N) => Math.floor(Math.log2(N)) + 1 },
      { code: '  return c', tex: '1', f: () => 1 },
    ],
    total: 'T = 3b + 3,\\quad b = \\lfloor \\log_2 N \\rfloor + 1',
    terms: [{ tex: '3\\log_2 N', f: (N) => 3 * Math.log2(N) }, { tex: '3', f: () => 3 }],
    space: { tex: '1', f: () => 1, note: 'العداد c فقط (وN نفسه يُعدّل في مكانه).' },
    measure(N) {
      const c = [0, 0, 0, 0, 0, 0];
      let x = N, k = 0; c[1]++;
      for (;;) { c[2]++; if (!(x > 0)) break; x = Math.floor(x / 2); c[3]++; k++; c[4]++; }
      c[5]++;
      return { counts: c, space: 1 };
    },
  },
];

export const lineTotal = (counts: number[]) => counts.reduce((a, b) => a + b, 0);

// Generating arrangements and selections by recursion, one choice at a time (lesson 0.7).

export type Mode = 'perm' | 'comb' | 'multi';

export interface EnumFrame {
  line: number;
  prefix: number[];
  depth: number;
  out: number[][];
  calls: number;
  note: string;
}

export const ENUM_PSEUDO: Record<Mode, string[]> = {
  perm: [
    'ARRANGE(prefix):              // k-permutations of n',
    '  if |prefix| = k: output prefix; return',
    '  for x ← 1 to n:',
    '    if x not in prefix:',
    '      ARRANGE(prefix + [x])',
  ],
  comb: [
    'CHOOSE(prefix, start):        // k-subsets of n',
    '  if |prefix| = k: output prefix; return',
    '  for x ← start to n:',
    '    // only larger elements: each subset once',
    '      CHOOSE(prefix + [x], x + 1)',
  ],
  multi: [
    'MULTI(prefix, start):         // k-multisets of n',
    '  if |prefix| = k: output prefix; return',
    '  for x ← start to n:',
    '    // x may repeat: start from x, not x + 1',
    '      MULTI(prefix + [x], x)',
  ],
};

export function* enumerate(mode: Mode, n: number, k: number, maxOut = 400): Generator<EnumFrame> {
  const out: number[][] = [];
  let calls = 0;
  const snap = (f: Omit<EnumFrame, 'out' | 'calls'>): EnumFrame => ({ ...f, out: [...out], calls });
  function* go(prefix: number[], start: number): Generator<EnumFrame> {
    calls++;
    if (prefix.length === k) {
      out.push(prefix);
      yield snap({ line: 2, prefix, depth: prefix.length, note: `اكتمل اختيار: (${prefix.join(', ')})` });
      return;
    }
    if (out.length >= maxOut) return;
    const from = mode === 'perm' ? 1 : start;
    for (let x = from; x <= n; x++) {
      if (mode === 'perm' && prefix.includes(x)) continue;
      yield snap({ line: mode === 'perm' ? 5 : 5, prefix: [...prefix, x], depth: prefix.length + 1, note: `نختار ${x} في الموضع ${prefix.length + 1}` });
      yield* go([...prefix, x], mode === 'comb' ? x + 1 : x);
      if (out.length >= maxOut) return;
    }
  }
  yield snap({ line: 1, prefix: [], depth: 0, note: 'نبدأ ببادئة فارغة.' });
  yield* go([], 1);
  yield snap({ line: 1, prefix: [], depth: 0, note: `انتهى: ${out.length} نتيجة، و${calls} استدعاء.` });
}

export function factorial(n: number): number {
  let p = 1;
  for (let i = 2; i <= n; i++) p *= i;
  return p;
}

export function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export function expected(mode: Mode, n: number, k: number): number {
  if (mode === 'perm') return k > n ? 0 : factorial(n) / factorial(n - k);
  if (mode === 'comb') return binom(n, k);
  return binom(n + k - 1, k);
}

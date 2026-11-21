// Tiny word-RAM programs for lesson 1.1. Every executed pseudocode line costs one step,
// and we record which memory cells each step reads and writes.

export interface RamFrame {
  line: number;
  vars: Record<string, number | string>;
  readA: number[]; // indices of A read in this step
  readT: number[];
  writeT: number[];
  T?: number[];
  steps: number;
  done?: string;
}

export interface RamProgram {
  key: string;
  label: string;
  pseudo: string[];
  usesTable: boolean;
  run: (A: number[]) => Generator<RamFrame>;
  /** Steps as a function of n in the worst case (shown next to the counter). */
  worst: string;
}

export const DAYS = 31;

export const PROGRAMS: RamProgram[] = [
  {
    key: 'sum', label: 'المجموع', usesTable: false, worst: '2n + 2',
    pseudo: ['SUM(A, n):', '  s ← 0', '  for i ← 0 to n − 1:', '    s ← s + A[i]', '  return s'],
    *run(A): Generator<RamFrame> {
      let steps = 0, s = 0;
      const f = (line: number, extra: Partial<RamFrame> = {}): RamFrame => ({ line, vars: { s }, readA: [], readT: [], writeT: [], steps, ...extra });
      steps++; yield f(2);
      for (let i = 0; i < A.length; i++) {
        steps++; yield { ...f(3), vars: { s, i } };
        s += A[i];
        steps++; yield { ...f(4), vars: { s, i }, readA: [i] };
      }
      steps++; yield { ...f(5), done: `s = ${s}` };
    },
  },
  {
    key: 'max', label: 'الأكبر', usesTable: false, worst: '2n',
    pseudo: ['MAX(A, n):', '  m ← A[0]', '  for i ← 1 to n − 1:', '    if A[i] > m: m ← A[i]', '  return m'],
    *run(A): Generator<RamFrame> {
      let steps = 0, m = A[0];
      steps++; yield { line: 2, vars: { m }, readA: [0], readT: [], writeT: [], steps };
      for (let i = 1; i < A.length; i++) {
        steps++; yield { line: 3, vars: { m, i }, readA: [], readT: [], writeT: [], steps };
        if (A[i] > m) m = A[i];
        steps++; yield { line: 4, vars: { m, i }, readA: [i], readT: [], writeT: [], steps };
      }
      steps++; yield { line: 5, vars: { m }, readA: [], readT: [], writeT: [], steps, done: `m = ${m}` };
    },
  },
  {
    key: 'pairs', label: 'تكرار: كل الأزواج', usesTable: false, worst: 'n² + 1',
    pseudo: ['HAS-DUP-PAIRS(A, n):', '  for i ← 0 to n − 1:', '    for j ← i + 1 to n − 1:', '      if A[i] = A[j]: return TRUE', '  return FALSE'],
    *run(A): Generator<RamFrame> {
      let steps = 0;
      const n = A.length;
      for (let i = 0; i < n; i++) {
        steps++; yield { line: 2, vars: { i }, readA: [], readT: [], writeT: [], steps };
        for (let j = i + 1; j < n; j++) {
          steps++; yield { line: 3, vars: { i, j }, readA: [], readT: [], writeT: [], steps };
          steps++;
          if (A[i] === A[j]) { yield { line: 4, vars: { i, j }, readA: [i, j], readT: [], writeT: [], steps, done: `TRUE: A[${i}] = A[${j}] = ${A[i]}` }; return; }
          yield { line: 4, vars: { i, j }, readA: [i, j], readT: [], writeT: [], steps };
        }
      }
      steps++; yield { line: 5, vars: {}, readA: [], readT: [], writeT: [], steps, done: 'FALSE' };
    },
  },
  {
    key: 'table', label: 'تكرار: جدول مباشر', usesTable: true, worst: '3n + 33',
    pseudo: ['HAS-DUP-TABLE(A, n):      // values in 1..31', '  T ← array of 32 zeros     // 32 steps, once', '  for i ← 0 to n − 1:', '    if T[A[i]] = 1: return TRUE', '    T[A[i]] ← 1', '  return FALSE'],
    *run(A): Generator<RamFrame> {
      let steps = 32;
      const T = Array(DAYS + 1).fill(0);
      yield { line: 2, vars: {}, readA: [], readT: [], writeT: [], T: [...T], steps };
      for (let i = 0; i < A.length; i++) {
        steps++; yield { line: 3, vars: { i }, readA: [], readT: [], writeT: [], T: [...T], steps };
        steps++;
        if (T[A[i]] === 1) { yield { line: 4, vars: { i, 'A[i]': A[i] }, readA: [i], readT: [A[i]], writeT: [], T: [...T], steps, done: `TRUE: اليوم ${A[i]} مسجّل من قبل` }; return; }
        yield { line: 4, vars: { i, 'A[i]': A[i] }, readA: [i], readT: [A[i]], writeT: [], T: [...T], steps };
        T[A[i]] = 1;
        steps++; yield { line: 5, vars: { i, 'A[i]': A[i] }, readA: [i], readT: [], writeT: [A[i]], T: [...T], steps };
      }
      steps++; yield { line: 6, vars: {}, readA: [], readT: [], writeT: [], T: [...T], steps, done: 'FALSE' };
    },
  },
];

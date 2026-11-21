// Binary relations on {1, …, n}, stored as an n×n boolean matrix: M[i][j] means (i+1) R (j+1).

export type Matrix = boolean[][];

export const empty = (n: number): Matrix => Array.from({ length: n }, () => Array(n).fill(false));
export const fromPred = (n: number, p: (a: number, b: number) => boolean): Matrix =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => p(i + 1, j + 1)));

/** A pair, isolated left-to-right so it reads correctly inside Arabic text. */
const pr = (a: number, b: number) => `\u2066(${a}, ${b})\u2069`;

export interface Check {
  ok: boolean;
  /** Elements (1-based) that break the property, for highlighting. */
  witness?: number[];
  why?: string;
}

export function reflexive(M: Matrix): Check {
  for (let i = 0; i < M.length; i++) if (!M[i][i]) return { ok: false, witness: [i + 1, i + 1], why: `${pr(i + 1, i + 1)} ليست في العلاقة` };
  return { ok: true };
}

export function symmetric(M: Matrix): Check {
  for (let i = 0; i < M.length; i++)
    for (let j = 0; j < M.length; j++)
      if (M[i][j] && !M[j][i]) return { ok: false, witness: [i + 1, j + 1], why: `${pr(i + 1, j + 1)} فيها، لكن ${pr(j + 1, i + 1)} ليست فيها` };
  return { ok: true };
}

export function antisymmetric(M: Matrix): Check {
  for (let i = 0; i < M.length; i++)
    for (let j = 0; j < M.length; j++)
      if (i !== j && M[i][j] && M[j][i]) return { ok: false, witness: [i + 1, j + 1], why: `${pr(i + 1, j + 1)} و${pr(j + 1, i + 1)} فيها معًا، و\u2066${i + 1} ≠ ${j + 1}\u2069` };
  return { ok: true };
}

export function transitive(M: Matrix): Check {
  const n = M.length;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (M[i][j])
        for (let k = 0; k < n; k++)
          if (M[j][k] && !M[i][k]) return { ok: false, witness: [i + 1, j + 1, k + 1], why: `${pr(i + 1, j + 1)} و${pr(j + 1, k + 1)} فيها، لكن ${pr(i + 1, k + 1)} ليست فيها` };
  return { ok: true };
}

/** Equivalence classes, if M is an equivalence relation. */
export function classes(M: Matrix): number[][] {
  const seen = new Set<number>();
  const out: number[][] = [];
  for (let i = 0; i < M.length; i++) {
    if (seen.has(i)) continue;
    const cls: number[] = [];
    for (let j = 0; j < M.length; j++) if (M[i][j]) { cls.push(j + 1); seen.add(j); }
    out.push(cls);
  }
  return out;
}

export interface ClosureFrame {
  line: number;
  k: number;
  i: number;
  j: number;
  M: Matrix;
  added: [number, number][];
  checks: number;
  note: string;
}

export const WARSHALL_PSEUDO = [
  'TRANSITIVE-CLOSURE(M):    // n × n',
  '  for k ← 1 to n:          // allow k as a stop',
  '    for i ← 1 to n:',
  '      for j ← 1 to n:',
  '        if M[i][k] and M[k][j]: M[i][j] ← true',
  '  return M',
];

/** Warshall's algorithm, one frame per (k, i, j) where a new pair is added, plus one per k. */
export function* warshall(M0: Matrix): Generator<ClosureFrame> {
  const n = M0.length;
  const M = M0.map((r) => [...r]);
  const added: [number, number][] = [];
  let checks = 0;
  const snap = (f: Omit<ClosureFrame, 'M' | 'added' | 'checks'>): ClosureFrame => ({ ...f, M: M.map((r) => [...r]), added: [...added], checks });
  yield snap({ line: 1, k: -1, i: -1, j: -1, note: 'نبدأ من العلاقة كما هي.' });
  for (let k = 0; k < n; k++) {
    yield snap({ line: 2, k, i: -1, j: -1, note: `k = ${k + 1}: نسمح الآن بالمرور عبر ${k + 1}.` });
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        checks++;
        if (M[i][k] && M[k][j] && !M[i][j]) {
          M[i][j] = true;
          added.push([i + 1, j + 1]);
          yield snap({ line: 5, k, i, j, note: `\u2066${i + 1} → ${k + 1} → ${j + 1}\u2069، فنضيف ${pr(i + 1, j + 1)}.` });
        }
      }
  }
  yield snap({ line: 6, k: -1, i: -1, j: -1, note: `انتهى: أضفنا ${added.length} زوجًا بعد ${checks} فحصًا (n³ = ${n ** 3}).` });
}

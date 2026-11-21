// Book 2.6–2.7: two backtracking strategies for the longest increasing subsequence, with call counts.

export const PI_DIGITS = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6];

/** Take 1: LISbigger(i, j) on A with sentinel A[0] = −∞ (indices into the padded array). */
export function lisTake1(A: number[]) {
  const B = [-Infinity, ...A], n = A.length;
  let calls = 0;
  const go = (i: number, j: number): number => {
    calls++;
    if (j > n) return 0;
    if (B[i] >= B[j]) return go(i, j + 1);
    return Math.max(go(i, j + 1), 1 + go(j, j + 1));
  };
  const len = go(0, 1);
  return { len, calls };
}

/** Take 2: LISfirst(i) = 1 + max over j > i with A[j] > A[i]; with sentinel. */
export function lisTake2(A: number[]) {
  const B = [-Infinity, ...A], n = A.length;
  let calls = 0;
  const go = (i: number): number => {
    calls++;
    let best = 0;
    for (let j = i + 1; j <= n; j++) if (B[j] > B[i]) best = Math.max(best, go(j));
    return 1 + best;
  };
  const len = go(0) - 1;
  return { len, calls };
}

/** One longest increasing subsequence (indices, 0-based), by a quadratic table — for display only. */
export function lisWitness(A: number[]): number[] {
  const n = A.length, L = Array(n).fill(1), nxt = Array(n).fill(-1);
  for (let i = n - 1; i >= 0; i--) for (let j = i + 1; j < n; j++) if (A[j] > A[i] && 1 + L[j] > L[i]) { L[i] = 1 + L[j]; nxt[i] = j; }
  let s = 0;
  for (let i = 1; i < n; i++) if (L[i] > L[s]) s = i;
  const out: number[] = [];
  if (!n) return out;
  for (let i = s; i !== -1; i = nxt[i]) out.push(i);
  return out;
}

export interface LFrame1 { j: number; taken: number[]; prev: number; decision: 'skip' | 'take' | 'forced' | 'end'; best: number }

/** The "black bar" picture for Take 1: every decision on the path the search explores (for small n). */
export function take1Frames(A: number[], max = 3000): LFrame1[] {
  const out: LFrame1[] = [];
  let best = 0;
  const go = (prevIdx: number, j: number, taken: number[]) => {
    if (out.length >= max) return;
    const prev = prevIdx < 0 ? -Infinity : A[prevIdx];
    if (j === A.length) { best = Math.max(best, taken.length); out.push({ j, taken, prev, decision: 'end', best }); return; }
    if (A[j] <= prev) { out.push({ j, taken, prev, decision: 'forced', best }); go(prevIdx, j + 1, taken); return; }
    out.push({ j, taken, prev, decision: 'take', best });
    go(j, j + 1, [...taken, j]);
    out.push({ j, taken, prev, decision: 'skip', best });
    go(prevIdx, j + 1, taken);
  };
  go(-1, 0, []);
  return out;
}

// Exhaustive search recorded frame by frame for lesson 3.1: subset sum over all 2^n masks,
// and the travelling salesman over all (n − 1)! tours.

export interface SFrame {
  mask: number;
  sum: number;
  hit: boolean;
  hits: number[];      // masks found so far
  tried: number;
  done?: boolean;
}

export function* subsetFrames(w: number[], target: number): Generator<SFrame> {
  const n = w.length;
  const hits: number[] = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    let sum = 0;
    for (let i = 0; i < n; i++) if (mask >> i & 1) sum += w[i];
    const hit = sum === target;
    if (hit) hits.push(mask);
    yield { mask, sum, hit, hits: hits.slice(), tried: mask + 1, done: mask === (1 << n) - 1 };
  }
}

export type Pt = [number, number];
export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const tourLen = (P: Pt[], t: number[]) => t.reduce((s, v, i) => s + dist(P[v], P[t[(i + 1) % t.length]]), 0);

export interface TFrame { tour: number[]; len: number; best: number[]; bestLen: number; tried: number; improved: boolean; done?: boolean }

/** Next permutation in lexicographic order, in place. Returns false after the last one. */
export function nextPerm(a: number[]): boolean {
  let i = a.length - 2;
  while (i >= 0 && a[i] >= a[i + 1]) i--;
  if (i < 0) return false;
  let j = a.length - 1;
  while (a[j] <= a[i]) j--;
  [a[i], a[j]] = [a[j], a[i]];
  for (let l = i + 1, r = a.length - 1; l < r; l++, r--) [a[l], a[r]] = [a[r], a[l]];
  return true;
}

/** Every tour that starts at city 0: (n − 1)! of them (each tour and its reverse both appear). */
export function* tspFrames(P: Pt[]): Generator<TFrame> {
  const rest = Array.from({ length: P.length - 1 }, (_, i) => i + 1);
  let best: number[] = [], bestLen = Infinity, tried = 0;
  do {
    const tour = [0, ...rest];
    const len = tourLen(P, tour);
    tried++;
    const improved = len < bestLen - 1e-9;
    if (improved) { best = tour; bestLen = len; }
    yield { tour, len, best, bestLen, tried, improved };
  } while (nextPerm(rest));
}

export const factorial = (n: number) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

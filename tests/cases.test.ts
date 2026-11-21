import { describe, expect, it } from 'vitest';
import { CASE_ALGOS, distribution, permutations } from '../src/lib/cases';

describe('best / worst / average over all permutations', () => {
  it('permutations(n) lists n! distinct permutations', () => {
    for (let n = 1; n <= 6; n++) {
      const P = permutations(n);
      expect(P.length).toBe([1, 1, 2, 6, 24, 120, 720][n]);
      expect(new Set(P.map((p) => p.join())).size).toBe(P.length);
    }
  });
  for (const a of CASE_ALGOS) {
    it(`${a.key}: exact min, max and mean match the formulas for n = 1..8`, () => {
      for (let n = 1; n <= 8; n++) {
        const d = distribution(a, n);
        expect(d.exact).toBe(true);
        expect(d.min, `${a.key} best n=${n}`).toBe(a.best.f(n));
        expect(d.max, `${a.key} worst n=${n}`).toBe(a.worst.f(n));
        expect(d.mean, `${a.key} avg n=${n}`).toBeCloseTo(a.avg.f(n), 9);
      }
    });
  }
  it('sorted input is the worst case for first-pivot quicksort and the best for insertion sort', () => {
    const qs = CASE_ALGOS.find((a) => a.key === 'qs')!, ins = CASE_ALGOS.find((a) => a.key === 'ins')!;
    const sorted = Array.from({ length: 30 }, (_, i) => i + 1);
    expect(qs.cost(sorted)).toBe(435);
    expect(ins.cost(sorted)).toBe(29);
    expect(ins.cost([...sorted].reverse())).toBe(435);
  });
});

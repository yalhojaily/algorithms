import { describe, expect, it } from 'vitest';
import { COST_ALGOS, lineTotal } from '../src/lib/cost';

describe('cost tables', () => {
  for (const a of COST_ALGOS) {
    it(`${a.key}: measured counts match the closed forms`, () => {
      for (const n of a.sizes) {
        const { counts, space } = a.measure(n, n + 3);
        a.lines.forEach((l, i) => { if (l.f) expect(counts[i], `${a.key} line ${i} n=${n}`).toBe(l.f(n) + 0); });
        expect(space, `${a.key} space n=${n}`).toBe(a.space.f(n));
      }
    });
    it(`${a.key}: T(n) equals the sum of its terms (exactly, where the formula is exact)`, () => {
      for (const n of a.sizes.filter((n) => n >= 1)) {
        const total = lineTotal(a.measure(n, 5).counts);
        const fromTerms = a.terms.reduce((s, t) => s + t.f(n), 0);
        if (a.key === 'rev') expect(total).toBe(3 * Math.floor(n / 2) + 2);
        else if (a.key === 'bits') expect(total).toBe(3 * (Math.floor(Math.log2(n)) + 1) + 3);
        else expect(total).toBeCloseTo(fromTerms, 6);
      }
    });
  }
});

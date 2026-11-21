import { describe, expect, it } from 'vitest';
import { SORTS, makeArr } from '../src/lib/sortrace';
import { record } from '../src/engine/stepper';

describe('simple sorts', () => {
  for (const s of SORTS) {
    it(`${s.key} sorts every kind of input`, () => {
      for (const k of ['random', 'sorted', 'reversed', 'nearly', 'few'] as const) for (const n of [2, 5, 16, 24]) {
        const A = makeArr(k, n, n);
        const fr = record(s.run(A));
        expect(fr[fr.length - 1].arr).toEqual([...A].sort((a, b) => a - b));
      }
    });
  }
  it('selection always makes n(n−1)/2 comparisons; insertion n−1 on sorted input', () => {
    const n = 16;
    for (const k of ['random', 'sorted', 'reversed'] as const) {
      const fr = record(SORTS[1].run(makeArr(k, n)));
      expect(fr[fr.length - 1].comps).toBe((n * (n - 1)) / 2);
    }
    const ins = record(SORTS[0].run(makeArr('sorted', n)));
    expect(ins[ins.length - 1].comps).toBe(n - 1);
    const bub = record(SORTS[2].run(makeArr('sorted', n)));
    expect(bub[bub.length - 1].comps).toBe(n - 1);
  });
});

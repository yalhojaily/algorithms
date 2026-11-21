import { describe, expect, it } from 'vitest';
import { SORTED, bsFrames } from '../src/lib/bsearch';
import { record } from '../src/engine/stepper';

const res = (m: Parameters<typeof bsFrames>[0], x: number) => { const f = record(bsFrames(m, SORTED, x)); return f[f.length - 1]; };

describe('binary search forms', () => {
  it('find', () => {
    for (let x = 0; x <= 55; x++) {
      const r = res('find', x).result;
      if (SORTED.includes(x)) expect(SORTED[r!]).toBe(x); else expect(r).toBeNull();
    }
  });
  it('lower and upper bound match a linear scan', () => {
    for (let x = 0; x <= 55; x++) {
      expect(res('lower', x).result).toBe(SORTED.findIndex((v) => v >= x) === -1 ? SORTED.length : SORTED.findIndex((v) => v >= x));
      expect(res('upper', x).result).toBe(SORTED.findIndex((v) => v > x) === -1 ? SORTED.length : SORTED.findIndex((v) => v > x));
    }
  });
  it('comparisons ≤ ⌈log₂(n+1)⌉', () => {
    for (let x = 0; x <= 55; x++) for (const m of ['find', 'lower', 'upper'] as const) expect(res(m, x).comps).toBeLessThanOrEqual(Math.ceil(Math.log2(SORTED.length + 1)));
  });
  it('answer mode: ceil sqrt', () => {
    for (const x of [1, 2, 10, 16, 17, 99, 100, 1000]) expect(res('answer', x).result).toBe(Math.ceil(Math.sqrt(x)));
  });
});

import { describe, expect, it } from 'vitest';
import { euclid, smallestFactor } from '../src/lib/euclid';

const last = <T,>(g: Generator<T>) => { let x: T | undefined; for (const v of g) x = v; return x!; };

describe('Euclid: a prime outside any finite list', () => {
  it('smallestFactor', () => {
    expect(smallestFactor(30031n)).toBe(59n); // 2·3·5·7·11·13 + 1 = 59 · 509
    expect(smallestFactor(97n)).toBe(97n);
    expect(smallestFactor(16n)).toBe(2n);
  });
  it('first six primes give 59', () => {
    expect(last(euclid([2, 3, 5, 7, 11, 13])).factor).toBe(59n);
  });
  it('the factor can be small, but never in the list: {3, 5} → 16 → 2', () => {
    expect(last(euclid([3, 5])).factor).toBe(2n);
  });
  it('a prime N is found (first 11 primes give a prime)', () => {
    const f = last(euclid([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]));
    expect(f.factor).toBe(200560490131n);
  });
  it('the factor is never one of the listed primes', () => {
    const lists = [[2], [2, 3], [5, 7], [2, 7, 11], [3, 7, 13, 19], [2, 3, 5, 7, 11, 13, 17, 19]];
    for (const L of lists) expect(L).not.toContain(Number(last(euclid(L)).factor));
  });
});

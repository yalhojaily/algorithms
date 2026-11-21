import { describe, expect, it } from 'vitest';
import { latticeFrames, fromDigitsLE } from '../src/lib/lattice';
import { apportion, quotas } from '../src/lib/apportion';
import { bottles, christmas } from '../src/lib/songs';

describe('lattice multiplication', () => {
  it('computes products and counts m·n digit multiplications', () => {
    for (const [x, y] of [[934, 314], [0, 57], [99, 99], [1234, 5678], [7, 8]]) {
      const f = latticeFrames(x, y);
      const last = f[f.length - 1];
      expect(fromDigitsLE(last.Z)).toBe(String(x * y));
      expect(last.mults).toBe(String(x).length * String(y).length);
      expect(last.carry).toBe(0);
    }
  });
});

describe('apportionment', () => {
  const pop = [5_000_000, 1_200_000, 300_000, 9_100_000, 450_000];
  it('hands out exactly R seats, and Huntington-Hill gives every state one', () => {
    for (const m of ['hh', 'dhondt', 'webster'] as const) {
      for (const R of [5, 10, 37]) expect(apportion(pop, R, m).reduce((a, b) => a + b, 0)).toBe(R);
    }
    expect(Math.min(...apportion(pop, 5, 'hh'))).toBe(1);
    expect(apportion(pop, 10, 'dhondt')[2]).toBe(0);
  });
  it('stays within one seat of the quota for Webster on a typical input', () => {
    const q = quotas(pop, 37), r = apportion(pop, 37, 'webster');
    r.forEach((v, i) => expect(Math.abs(v - q[i])).toBeLessThan(1));
  });
});

describe('songs', () => {
  it('match the closed forms in the book', () => {
    for (let n = 1; n <= 30; n++) {
      expect(bottles(n).beer).toBe(3 * n + 3);
      const c = christmas(n);
      expect(c.mentions).toBe((n * (n + 1)) / 2);
      expect(c.gifts).toBe((n * (n + 1) * (n + 2)) / 6);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { RECURRENCES, direct, levels, master, masterExact, masterGrowth } from '../src/lib/recur';

describe('recursion trees', () => {
  for (const r of RECURRENCES) {
    it(`${r.key}: level sums = direct recursion = closed form`, () => {
      for (const n of r.sizes) {
        const L = levels(r, n);
        const sum = L.reduce((s, l) => s + l.total, 0);
        expect(sum, `${r.key} n=${n}`).toBeCloseTo(direct(r, n), 6);
        expect(sum, `${r.key} closed n=${n}`).toBeCloseTo(r.exact(n), 6);
      }
    });
  }
});

describe('master theorem', () => {
  it('classifies the classic recurrences', () => {
    expect(master(2, 2, 1).case).toBe(2);   // merge sort
    expect(master(1, 2, 0).case).toBe(2);   // binary search
    expect(master(4, 2, 1).case).toBe(1);
    expect(master(3, 2, 1).case).toBe(1);
    expect(master(2, 2, 2).case).toBe(3);
    expect(master(1, 2, 1).case).toBe(3);
    expect(master(2, 2, 1).thetaTex).toBe('\\Theta(n \\log n)');
    expect(master(1, 2, 0).thetaTex).toBe('\\Theta(\\log n)');
    expect(master(4, 2, 1).thetaTex).toBe('\\Theta(n^{2})');
    expect(master(2, 2, 1, 1).thetaTex).toBe('\\Theta(n \\log^{2} n)');
  });
  it('the exact solution divided by the prediction settles near a constant', () => {
    const cases: [number, number, number, number][] = [[2, 2, 1, 0], [4, 2, 1, 0], [3, 2, 1, 0], [2, 2, 2, 0], [1, 2, 0, 0], [8, 2, 2, 0], [2, 2, 1, 1], [9, 3, 2, 0]];
    for (const [a, b, d, k] of cases) {
      const r1 = masterExact(a, b, d, k, 24) / masterGrowth(a, b, d, k, b ** 24);
      const r2 = masterExact(a, b, d, k, 28) / masterGrowth(a, b, d, k, b ** 28);
      expect(Math.abs(r1 / r2 - 1), `${a},${b},${d},${k}`).toBeLessThan(0.2);
    }
  });
});

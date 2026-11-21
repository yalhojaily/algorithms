import { describe, expect, it } from 'vitest';
import { pushCost, simulate, totalCost, type Op } from '../src/lib/dynarray';

describe('dynamic array', () => {
  it('doubling: n pushes cost < 3n, and exactly n + (2^k − 1) copies', () => {
    for (let n = 1; n <= 2000; n++) {
      const c = pushCost(n, 'x2');
      expect(c).toBeLessThan(3 * n);
      const copies = c - n;
      const k = Math.ceil(Math.log2(n));
      expect(copies).toBe(2 ** k - 1);
    }
  });
  it('+1 growth: n pushes cost n(n+1)/2', () => {
    for (let n = 1; n <= 300; n++) expect(pushCost(n, 'plus1')).toBe((n * (n + 1)) / 2);
  });
  it('×1.5 is linear too (with a bigger constant)', () => {
    for (const n of [100, 1000, 10000]) expect(pushCost(n, 'x1.5')).toBeLessThan(4 * n);
  });
  it('half-shrink thrashes at the boundary; quarter-shrink does not', () => {
    const fill: Op[] = Array(8).fill('push'); // size 8, cap 8
    const flip: Op[] = [];
    for (let i = 0; i < 50; i++) flip.push('push', 'pop');
    const half = simulate([...fill, ...flip], 'x2', 'half');
    const quarter = simulate([...fill, ...flip], 'x2', 'quarter');
    const tail = (s: ReturnType<typeof simulate>) => totalCost(s.slice(8));
    expect(tail(half)).toBeGreaterThan(100 * 8);   // every op copies ~8 elements
    expect(tail(quarter)).toBeLessThan(100 * 2 + 20);
  });
  it('capacity never drops below size', () => {
    const ops: Op[] = [];
    for (let i = 0; i < 500; i++) ops.push(Math.random() < 0.55 ? 'push' : 'pop');
    for (const g of ['x2', 'x1.5', 'plus1', 'plus8'] as const)
      for (const s of ['none', 'half', 'quarter'] as const)
        for (const st of simulate(ops, g, s)) expect(st.cap).toBeGreaterThanOrEqual(st.size);
  });
});

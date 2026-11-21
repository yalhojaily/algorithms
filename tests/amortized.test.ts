import { describe, expect, it } from 'vitest';
import { arrayRun, counterRun, stackRun } from '../src/lib/amortized';

describe('amortized analysis', () => {
  it('binary counter: n increments flip fewer than 2n bits; amortized cost ≤ 2', () => {
    for (const n of [1, 7, 100, 255]) {
      const s = counterRun(Array(n).fill('inc'));
      const total = s.reduce((a, b) => a + b.cost, 0);
      expect(total).toBeLessThan(2 * n);
      for (const st of s) expect(st.amort).toBeLessThanOrEqual(2);
    }
  });
  it('binary counter: alternating inc/dec at 0111…1 costs the full width every time', () => {
    const ops: ('inc' | 'dec')[] = Array(127).fill('inc');
    for (let i = 0; i < 20; i++) ops.push('inc', 'dec');
    const s = counterRun(ops).slice(127);
    for (const st of s) expect(st.cost).toBe(8);
  });
  it('multipop stack: amortized ≤ 2 and total ≤ 2·pushes', () => {
    const ops: { op: 'push' | 'pop' | 'multipop'; k?: number }[] = [];
    for (let i = 0; i < 300; i++) { const r = Math.random(); ops.push(r < 0.6 ? { op: 'push' } : r < 0.8 ? { op: 'pop' } : { op: 'multipop', k: 1 + Math.floor(Math.random() * 6) }); }
    const s = stackRun(ops);
    for (const st of s) expect(st.amort).toBeLessThanOrEqual(2);
    expect(s.reduce((a, b) => a + b.cost, 0)).toBeLessThanOrEqual(2 * ops.filter((o) => o.op === 'push').length);
  });
  it('dynamic array: amortized push ≤ 3 and Φ ≥ 0', () => {
    for (const st of arrayRun(2000)) { expect(st.amort).toBeLessThanOrEqual(3); expect(st.phi).toBeGreaterThanOrEqual(0); }
  });
});

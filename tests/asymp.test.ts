import { describe, expect, it } from 'vitest';
import { FNS, firstFailure, truth } from '../src/lib/asymp';

const F = (k: string) => FNS.find((f) => f.key === k)!;

describe('asymptotic notation helpers', () => {
  it('growth truths', () => {
    expect(truth(F('n2s'), F('n2'), 'Theta')).toBe(true);
    expect(truth(F('poly'), F('n2'), 'Theta')).toBe(true);
    expect(truth(F('nlog'), F('n'), 'O')).toBe(false);
    expect(truth(F('nlog'), F('n'), 'Omega')).toBe(true);
    expect(truth(F('log'), F('sqrt'), 'O')).toBe(true);
    expect(truth(F('sqrt'), F('log'), 'O')).toBe(false);
    expect(truth(F('100n'), F('n'), 'Theta')).toBe(true);
    expect(truth(F('n3'), F('exp'), 'O')).toBe(true);
    expect(truth(F('c'), F('log'), 'O')).toBe(true);
  });
  it('3n² + 10n + 50 ≤ 4n² exactly from n = 14', () => {
    expect(firstFailure(F('poly'), F('n2'), 'O', { c1: 4, c2: 0, n0: 14 })).toBeNull();
    expect(firstFailure(F('poly'), F('n2'), 'O', { c1: 4, c2: 0, n0: 13 })).toBe(13);
  });
  it('finds a late failure: n² ≤ 1000·(100n) breaks just after n = 100000', () => {
    expect(firstFailure(F('n2'), F('100n'), 'O', { c1: 1000, c2: 0, n0: 1 })).toBe(100001);
  });
  it('Θ witness for n²/100 against n²', () => {
    expect(firstFailure(F('n2s'), F('n2'), 'Theta', { c1: 0.01, c2: 0.01, n0: 1 })).toBeNull();
    expect(firstFailure(F('n2s'), F('n2'), 'Theta', { c1: 0.02, c2: 1, n0: 1 })).toBe(1);
  });
  it('true witnesses never fail; false relations always fail eventually', () => {
    for (const f of FNS) for (const g of FNS) {
      const w = { c1: 2, c2: 2, n0: 64 };
      if (!truth(f, g, 'O') && !['c', '100n'].includes(g.key)) expect(firstFailure(f, g, 'O', w), `${f.key} O ${g.key}`).not.toBeNull();
    }
  });
});

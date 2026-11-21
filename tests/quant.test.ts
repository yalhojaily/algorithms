import { describe, expect, it } from 'vitest';
import { evaluate, PATTERNS, truth } from '../src/lib/quant';

const P = (k: string) => PATTERNS.find((p) => p.key === k)!;
const D = [-2, -1, 0, 1, 2];
const pred = (f: (x: number, y: number) => boolean) => (xi: number, yi: number) => f(D[xi], D[yi]);

describe('nested quantifiers over a finite domain', () => {
  it('order matters: ∀x∃y x+y=0 is true, ∃y∀x x+y=0 is false', () => {
    expect(truth(P('AE'), D.length, pred((x, y) => x + y === 0))).toBe(true);
    expect(truth(P('EA'), D.length, pred((x, y) => x + y === 0))).toBe(false);
  });
  it('∃y∀x x ≤ y is true (the maximum is a witness)', () => {
    expect(truth(P('EA'), D.length, pred((x, y) => x <= y))).toBe(true);
  });
  it('∀x∀y and ∃x∃y', () => {
    expect(truth(P('AA'), D.length, pred((x, y) => x * y >= -4))).toBe(true);
    expect(truth(P('AA'), D.length, pred((x, y) => x !== y))).toBe(false);
    expect(truth(P('EE'), D.length, pred((x, y) => x * y === 4))).toBe(true);
    expect(truth(P('EE'), D.length, pred((x, y) => x * y === 3))).toBe(false);
  });
  it('stops early: ∀x∃y x<y fails at the largest x after checking its whole row', () => {
    const frames = [...evaluate(P('AE'), D.length, pred((x, y) => x < y))];
    const last = frames[frames.length - 1];
    expect(last.verdict).toBe(false);
    expect(last.witness).toBe(4); // x = 2 has no larger y
    expect(last.checks).toBe(2 + 3 + 4 + 5 + 5); // each row stops at its first larger y; x = 2 scans all
  });
});

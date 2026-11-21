import { describe, expect, it } from 'vitest';
import { EXPERIMENTS, runExperiment } from '../src/lib/montecarlo';

const E = (k: string) => EXPERIMENTS.find((e) => e.key === k)!;

describe('Monte Carlo estimates converge to the exact answers', () => {
  it('Monty Hall', () => {
    const sw = runExperiment(E('monty'), 1).at(-1)!.mean;
    const st = runExperiment(E('monty'), 0).at(-1)!.mean;
    expect(Math.abs(sw - 2 / 3)).toBeLessThan(0.02);
    expect(Math.abs(st - 1 / 3)).toBeLessThan(0.02);
  });
  it('birthday with 23 people is about 50.7%', () => {
    expect(E('birthday').exact(23)).toBeCloseTo(0.5073, 3);
    expect(Math.abs(runExperiment(E('birthday'), 23).at(-1)!.mean - 0.5073)).toBeLessThan(0.02);
  });
  it('coupon collector ≈ n·H_n, fixed points ≈ 1', () => {
    expect(Math.abs(runExperiment(E('coupon'), 10).at(-1)!.mean - E('coupon').exact(10)) / E('coupon').exact(10)).toBeLessThan(0.03);
    expect(Math.abs(runExperiment(E('hats'), 100).at(-1)!.mean - 1)).toBeLessThan(0.05);
  });
});

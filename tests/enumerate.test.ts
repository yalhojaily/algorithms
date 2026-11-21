import { describe, expect, it } from 'vitest';
import { enumerate, expected, type Mode } from '../src/lib/enumerate';

const last = <T,>(g: Generator<T>) => { let x: T | undefined; for (const v of g) x = v; return x!; };

describe('enumerating arrangements and selections', () => {
  it('matches the counting formulas', () => {
    for (const mode of ['perm', 'comb', 'multi'] as Mode[])
      for (let n = 1; n <= 5; n++)
        for (let k = 0; k <= n; k++) expect(last(enumerate(mode, n, k)).out.length).toBe(expected(mode, n, k));
  });
  it('outputs are distinct', () => {
    const out = last(enumerate('comb', 5, 3)).out.map((x) => x.join());
    expect(new Set(out).size).toBe(10);
  });
});

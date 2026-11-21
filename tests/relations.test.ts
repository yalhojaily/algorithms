import { describe, expect, it } from 'vitest';
import { antisymmetric, classes, fromPred, reflexive, symmetric, transitive, warshall } from '../src/lib/relations';

const last = <T,>(g: Generator<T>) => { let x: T | undefined; for (const v of g) x = v; return x!; };

describe('relation properties', () => {
  it('≤ is a partial order', () => {
    const M = fromPred(5, (a, b) => a <= b);
    expect([reflexive(M).ok, symmetric(M).ok, antisymmetric(M).ok, transitive(M).ok]).toEqual([true, false, true, true]);
  });
  it('congruence mod 3 is an equivalence with 3 classes', () => {
    const M = fromPred(6, (a, b) => (a - b) % 3 === 0);
    expect(reflexive(M).ok && symmetric(M).ok && transitive(M).ok).toBe(true);
    expect(classes(M)).toEqual([[1, 4], [2, 5], [3, 6]]);
  });
  it('gives a witness when transitivity fails', () => {
    const M = fromPred(4, (a, b) => b === a + 1);
    expect(transitive(M)).toMatchObject({ ok: false, witness: [1, 2, 3] });
  });
  it('Warshall: the closure of "b = a + 1" is "<"', () => {
    const f = last(warshall(fromPred(5, (a, b) => b === a + 1)));
    expect(f.M).toEqual(fromPred(5, (a, b) => a < b));
    expect(f.checks).toBe(125);
  });
});

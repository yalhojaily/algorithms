import { describe, expect, it } from 'vitest';
import { INV_PROGRAMS, evaluate, gcd, isSorted } from '../src/lib/invariants';
import { record } from '../src/engine/stepper';

describe('loop-invariant programs', () => {
  for (const p of INV_PROGRAMS) {
    describe(p.label, () => {
      it('candidates marked as holding hold at every check, on many inputs', () => {
        for (const c of p.candidates.filter((c) => c.holds))
          for (let seed = 1; seed <= 60; seed++) expect(evaluate(p, c, seed).every(Boolean), `${p.key}/${c.id}/${seed}`).toBe(true);
      });
      it('candidates marked as false fail on the default input (seed 7)', () => {
        for (const c of p.candidates.filter((c) => !c.holds)) expect(evaluate(p, c, 7).some((v) => !v), `${p.key}/${c.id}`).toBe(true);
      });
      it('has exactly one strong candidate, and it holds', () => {
        const strong = p.candidates.filter((c) => c.strong);
        expect(strong.length).toBe(1);
        expect(strong[0].holds).toBe(true);
      });
      it('produces a correct final answer', () => {
        for (let seed = 1; seed <= 40; seed++) {
          const inp = p.make(seed);
          const frames = record(p.run(inp));
          const last = frames[frames.length - 1];
          expect(last.done).toBeTruthy();
          if (p.key === 'sum') expect(last.vars.s).toBe(inp.arr.reduce((a, b) => a + b, 0));
          if (p.key === 'max') expect(last.vars.m).toBe(Math.max(...inp.arr));
          if (p.key === 'ins') expect(isSorted(last.arr)).toBe(true);
          if (p.key === 'gcd') expect(last.vars.a).toBe(gcd(inp.vars.a, inp.vars.b));
          if (p.key === 'peasant') expect(last.vars.prod).toBe(inp.vars.x * inp.vars.y);
          if (p.key === 'bs') {
            const present = inp.arr.includes(inp.vars.x);
            expect(last.done === 'NOT-FOUND').toBe(!present);
            expect(present).toBe(seed % 2 === 0);
          }
        }
      });
    });
  }
});

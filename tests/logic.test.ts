import { describe, expect, it } from 'vitest';
import { assignments, classify, counterexample, evaluate, parse, ParseError, show, subformulas, variables } from '../src/lib/logic';

const p = (s: string) => show(parse(s));

describe('parse + show', () => {
  it('respects precedence: NOT > AND > XOR > OR > IMPLIES > IFF', () => {
    expect(p('!P & Q | R')).toBe('¬P ∧ Q ∨ R');
    expect(p('P | Q & R')).toBe('P ∨ Q ∧ R');
    expect(p('(P | Q) & R')).toBe('(P ∨ Q) ∧ R');
    expect(p('P -> Q <-> !Q -> !P')).toBe('P → Q ↔ ¬Q → ¬P');
  });
  it('makes IMPLIES right-associative', () => {
    const f = parse('P -> Q -> R');
    expect(f.kind === 'bin' && f.right.kind === 'bin').toBe(true);
    expect(p('(P -> Q) -> R')).toBe('(P → Q) → R');
  });
  it('accepts words, unicode and C-style operators', () => {
    expect(p('not P and Q')).toBe('¬P ∧ Q');
    expect(p('P ∧ ¬Q')).toBe('P ∧ ¬Q');
    expect(p('P && !Q || R')).toBe('P ∧ ¬Q ∨ R');
    expect(p('P xor Q')).toBe('P ⊕ Q');
  });
  it('keeps parentheses under negation', () => {
    expect(p('!(P & Q)')).toBe('¬(P ∧ Q)');
  });
  it('rejects malformed input with a position', () => {
    expect(() => parse('P &')).toThrow(ParseError);
    expect(() => parse('(P | Q')).toThrow(ParseError);
    expect(() => parse('P Q')).toThrow(ParseError);
    expect(() => parse('PQ')).toThrow(ParseError);
    expect(() => parse('')).toThrow(ParseError);
  });
});

describe('semantics', () => {
  it('evaluates implication with vacuous truth', () => {
    const f = parse('P -> Q');
    expect(evaluate(f, { P: false, Q: false })).toBe(true);
    expect(evaluate(f, { P: true, Q: false })).toBe(false);
  });
  it('lists variables and assignments in textbook order', () => {
    expect(variables(parse('Q | P & R'))).toEqual(['P', 'Q', 'R']);
    const rows = assignments(['P', 'Q']);
    expect(rows).toEqual([{ P: true, Q: true }, { P: true, Q: false }, { P: false, Q: true }, { P: false, Q: false }]);
  });
  it('classifies formulas', () => {
    expect(classify(parse('P | !P'))).toBe('tautology');
    expect(classify(parse('P & !P'))).toBe('contradiction');
    expect(classify(parse('P -> Q'))).toBe('contingent');
    expect(classify(parse('(P -> Q) <-> (!Q -> !P)'))).toBe('tautology');
  });
  it('finds counterexamples to equivalence', () => {
    expect(counterexample(parse('!(P & Q)'), parse('!P | !Q'))).toBeNull();
    expect(counterexample(parse('P -> Q'), parse('Q -> P'))).toEqual({ P: true, Q: false });
  });
  it('lists compound subformulas innermost first, without duplicates', () => {
    const cols = subformulas(parse('!(P & Q) <-> !P | !Q')).map((f) => show(f));
    expect(cols).toEqual(['P ∧ Q', '¬(P ∧ Q)', '¬P', '¬Q', '¬P ∨ ¬Q', '¬(P ∧ Q) ↔ ¬P ∨ ¬Q']);
  });
});

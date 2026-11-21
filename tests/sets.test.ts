import { describe, expect, it } from 'vitest';
import { member, parseSet, REGIONS, SetParseError, showSet } from '../src/lib/sets';

const same = (x: string, y: string) => REGIONS.every(([a, b, c]) => member(parseSet(x), a, b, c) === member(parseSet(y), a, b, c));

describe('set expressions', () => {
  it('parses with precedence: ∩ before ∪', () => {
    expect(showSet(parseSet('A | B & C'))).toBe('A ∪ B ∩ C');
    expect(showSet(parseSet('(A | B) & C'))).toBe('(A ∪ B) ∩ C');
    expect(showSet(parseSet("(A ∪ B)'"))).toBe('(A ∪ B)ᶜ');
    expect(showSet(parseSet('A - (B - C)'))).toBe('A − (B − C)');
  });
  it('verifies identities region by region', () => {
    expect(same("(A ∪ B)'", "A' ∩ B'")).toBe(true); // De Morgan
    expect(same('A ∩ (B ∪ C)', '(A ∩ B) ∪ (A ∩ C)')).toBe(true);
    expect(same('A − B', "A ∩ B'")).toBe(true);
    expect(same('A Δ B', '(A − B) ∪ (B − A)')).toBe(true);
    expect(same('A − (B − C)', '(A − B) − C')).toBe(false);
    expect(same('A ∪ B ∩ C', '(A ∪ B) ∩ C')).toBe(false);
  });
  it('handles U, ∅ and prefix complement', () => {
    expect(same('A ∪ ~A', 'U')).toBe(true);
    expect(same('A ∩ ∅', '∅')).toBe(true);
  });
  it('rejects bad input', () => {
    expect(() => parseSet('A ∪')).toThrow(SetParseError);
    expect(() => parseSet('(A')).toThrow(SetParseError);
    expect(() => parseSet('A D')).toThrow(SetParseError);
  });
});

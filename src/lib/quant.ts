// Evaluating two nested quantifiers over a finite domain, as two nested loops with early exit.
// Used by the QuantifierGrid simulation in lesson 0.2.

export type Q = 'forall' | 'exists';
export type Var = 'x' | 'y';

export interface Pattern {
  key: string;
  outer: { q: Q; v: Var };
  inner: { q: Q; v: Var };
  tex: string;
}

export const PATTERNS: Pattern[] = [
  { key: 'AE', outer: { q: 'forall', v: 'x' }, inner: { q: 'exists', v: 'y' }, tex: '\\forall x\\, \\exists y' },
  { key: 'EA', outer: { q: 'exists', v: 'y' }, inner: { q: 'forall', v: 'x' }, tex: '\\exists y\\, \\forall x' },
  { key: 'AA', outer: { q: 'forall', v: 'x' }, inner: { q: 'forall', v: 'y' }, tex: '\\forall x\\, \\forall y' },
  { key: 'EE', outer: { q: 'exists', v: 'x' }, inner: { q: 'exists', v: 'y' }, tex: '\\exists x\\, \\exists y' },
];

export interface Frame {
  line: number;
  o: number; // index of the outer value being tried (-1 before the loop)
  i: number; // index of the inner value being checked (-1 = none)
  checked: [number, number][]; // [xIndex, yIndex] cells evaluated so far
  results: (boolean | undefined)[]; // the inner quantifier's verdict for each outer value tried
  checks: number;
  verdict?: boolean;
  witness?: number; // outer index that decided the answer (witness or counterexample)
  innerWitness?: number[]; // for each outer value, the inner index that decided it
}

/** Pseudocode for a pattern, with the loop variables named as in the formula. */
export function pseudocode(p: Pattern): string[] {
  const o = p.outer.v;
  const i = p.inner.v;
  const innerAll = p.inner.q === 'forall';
  const outerAll = p.outer.q === 'forall';
  return [
    `EVAL(D, P):    // ${outerAll ? '∀' : '∃'}${o} ${innerAll ? '∀' : '∃'}${i} P(x, y)`,
    `  for each ${o} in D:`,
    `    ok ← ${innerAll ? 'true' : 'false'}`,
    `    for each ${i} in D:`,
    innerAll ? `      if not P(x, y): ok ← false; break` : `      if P(x, y): ok ← true; break`,
    outerAll ? `    if not ok: return FALSE   // counterexample` : `    if ok: return TRUE        // witness`,
    `  return ${outerAll ? 'TRUE' : 'FALSE'}`,
  ];
}

/** Every step of the nested-loop evaluation. `P(xi, yi)` takes indices into the domain. */
export function* evaluate(p: Pattern, n: number, P: (xi: number, yi: number) => boolean): Generator<Frame> {
  const checked: [number, number][] = [];
  const results: (boolean | undefined)[] = Array(n).fill(undefined);
  const innerWitness: number[] = Array(n).fill(-1);
  let checks = 0;
  const snap = (f: Omit<Frame, 'checked' | 'results' | 'checks' | 'innerWitness'>): Frame => ({
    ...f, checked: [...checked], results: [...results], checks, innerWitness: [...innerWitness],
  });
  const innerAll = p.inner.q === 'forall';
  const outerAll = p.outer.q === 'forall';

  for (let o = 0; o < n; o++) {
    yield snap({ line: 2, o, i: -1 });
    let ok = innerAll;
    for (let i = 0; i < n; i++) {
      const [xi, yi] = p.outer.v === 'x' ? [o, i] : [i, o];
      checked.push([xi, yi]);
      checks++;
      const v = P(xi, yi);
      yield snap({ line: 5, o, i });
      if (innerAll ? !v : v) {
        ok = !innerAll;
        innerWitness[o] = i;
        break;
      }
    }
    results[o] = ok;
    if (outerAll ? !ok : ok) {
      yield snap({ line: 6, o, i: -1, verdict: !outerAll, witness: o });
      return;
    }
    yield snap({ line: 6, o, i: -1 });
  }
  yield snap({ line: 7, o: n, i: -1, verdict: outerAll });
}

/** The answer without the steps (for tests and quick checks). */
export function truth(p: Pattern, n: number, P: (xi: number, yi: number) => boolean): boolean {
  let last: Frame | undefined;
  for (const f of evaluate(p, n, P)) last = f;
  return last!.verdict!;
}

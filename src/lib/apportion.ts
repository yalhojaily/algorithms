// Book 0.3: apportionment by priorities. Seats are handed out one at a time to the state of highest priority.
// With seats starting at r = 0, Huntington-Hill's priority P/√(r(r+1)) is infinite, which is exactly the
// constitutional guarantee of one seat per state; D'Hondt and Webster give no such guarantee.

export type Method = 'hh' | 'dhondt' | 'webster';

export const METHODS: Record<Method, { en: string; ar: string; formula: string; pr: (P: number, r: number) => number }> = {
  hh: { en: 'Huntington-Hill', ar: 'Huntington-Hill (الكونغرس الأمريكي)', formula: 'P / √(r(r+1))', pr: (P, r) => (r === 0 ? Infinity : P / Math.sqrt(r * (r + 1))) },
  dhondt: { en: "D'Hondt / Jefferson", ar: "D'Hondt (طريقة Jefferson)", formula: 'P / (r+1)', pr: (P, r) => P / (r + 1) },
  webster: { en: 'Webster / Sainte-Laguë', ar: 'Webster / Sainte-Laguë', formula: 'P / (2r+1)', pr: (P, r) => P / (2 * r + 1) },
};

export interface AFrame {
  seat: number;            // seats handed out so far
  rep: number[];
  last: number | null;     // the state that just got a seat
  queue: { s: number; p: number }[];   // priorities after this step, highest first
}

/** All R steps. Ties go to the lower index, so the result is deterministic. */
export function apportionFrames(pop: number[], R: number, method: Method): AFrame[] {
  const pr = METHODS[method].pr;
  const rep = pop.map(() => 0);
  const q = () => pop.map((P, s) => ({ s, p: pr(P, rep[s]) })).sort((a, b) => b.p - a.p || a.s - b.s);
  const out: AFrame[] = [{ seat: 0, rep: [...rep], last: null, queue: q() }];
  for (let k = 1; k <= R; k++) {
    const s = q()[0].s;
    rep[s]++;
    out.push({ seat: k, rep: [...rep], last: s, queue: q() });
  }
  return out;
}

export const apportion = (pop: number[], R: number, method: Method): number[] => {
  const f = apportionFrames(pop, R, method);
  return f[f.length - 1].rep;
};

/** The ideal (fractional) quota of each state. */
export const quotas = (pop: number[], R: number) => {
  const P = pop.reduce((a, b) => a + b, 0);
  return pop.map((p) => (p * R) / P);
};

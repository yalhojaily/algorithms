import { describe, expect, it } from 'vitest';
import { BOOK3, BOOK4, SALLOWS, galeShapley, huffmanFrames, maxSchedule, randomClasses, randomPrefs, scheduleFrames, tapeCost, unstablePairs } from '../src/lib/greedy';

const perms = (n: number): number[][] => (n === 0 ? [[]] : perms(n - 1).flatMap((p) => Array.from({ length: n }, (_, k) => [...p.slice(0, k), n - 1, ...p.slice(k)])));

describe('tape', () => {
  it('sorting by L/F is optimal', () => {
    for (let t = 0; t < 30; t++) {
      const n = 5, L = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 9)), F = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 9));
      const best = Math.min(...perms(n).map((p) => tapeCost(p, L, F)));
      const g = [...Array(n).keys()].sort((a, b) => L[a] / F[a] - L[b] / F[b]);
      expect(tapeCost(g, L, F)).toBe(best);
    }
  });
});

describe('scheduling', () => {
  it('greedy by finish time matches the DP maximum', () => {
    for (let s = 1; s < 60; s++) {
      const c = randomClasses(14, s);
      expect(scheduleFrames(c).frames.at(-1)!.taken.length).toBe(maxSchedule(c));
    }
  });
});

describe('huffman', () => {
  it('Sallows sentence needs 649 bits, and the code is prefix-free', () => {
    const h = huffmanFrames(SALLOWS);
    expect(h.bits).toBe(649);
    const cs = Object.values(h.codes);
    for (const a of cs) for (const b of cs) if (a !== b) expect(b.startsWith(a)).toBe(false);
  });
});

describe('stable matching', () => {
  it('replays the book trace and result', () => {
    const r = galeShapley(BOOK4, 'H', true);
    expect(r.matching).toEqual({ A: 's', B: 't', C: 'q', D: 'r' });
    expect(r.offers).toBe(10);
    expect(unstablePairs(BOOK4, r.matching)).toEqual([]);
    // The book calls {Ar, Bs, Cq, Dt} stable too, but (q, B) is an unstable pair: the stable matching is unique.
    expect(unstablePairs(BOOK4, { A: 'r', B: 's', C: 'q', D: 't' })).toEqual([['q', 'B']]);
    expect(galeShapley(BOOK4, 'D').matching).toEqual(r.matching);
    expect(unstablePairs(BOOK3, { A: 'q', B: 'r', C: 's' })).toContainEqual(['r', 'A']);
  });
  it('is stable, hospital-optimal and doctor-pessimal on random inputs', () => {
    for (let s = 1; s < 25; s++) {
      const p = randomPrefs(5, s);
      const mh = galeShapley(p, 'H').matching, md = galeShapley(p, 'D').matching;
      expect(unstablePairs(p, mh)).toEqual([]);
      expect(unstablePairs(p, md)).toEqual([]);
      const stable = perms(5).map((q) => Object.fromEntries(p.H.map((h, i) => [h, p.D[q[i]]]))).filter((m) => unstablePairs(p, m).length === 0);
      for (const m of stable) for (const h of p.H) {
        const hp = p.hpref[p.H.indexOf(h)];
        expect(hp.indexOf(mh[h])).toBeLessThanOrEqual(hp.indexOf(m[h]));
        expect(hp.indexOf(md[h])).toBeGreaterThanOrEqual(hp.indexOf(m[h]));
      }
    }
  });
});

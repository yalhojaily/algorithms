import { describe, expect, it } from 'vitest';
import { record } from '../src/engine/stepper';
import { factorial, nextPerm, subsetFrames, tspFrames, tourLen, type Pt } from '../src/lib/bruteforce';
import { karaFrames } from '../src/lib/karatsuba';
import { cpFrames, d2, type P2 } from '../src/lib/closestpair';
import { bruteOptimum, depth, greedyFrames, optimum, partitionFrames, overlap, type Iv } from '../src/lib/intervals';
import { mulberry32 } from '../src/lib/montecarlo';

const last = <T,>(g: Generator<T>) => { const f = record(g, 200000); return f[f.length - 1]; };

describe('brute force', () => {
  it('subset sum finds every hit', () => {
    const w = [3, 5, 6, 7, 2, 8];
    const f = last(subsetFrames(w, 13));
    let want = 0;
    for (let m = 0; m < 64; m++) if (w.reduce((s, x, i) => s + (m >> i & 1 ? x : 0), 0) === 13) want++;
    expect(f.hits.length).toBe(want);
    expect(f.tried).toBe(64);
  });
  it('next permutation enumerates n! orders', () => {
    const a = [1, 2, 3, 4];
    let c = 1;
    while (nextPerm(a)) c++;
    expect(c).toBe(24);
  });
  it('TSP tries (n − 1)! tours and finds the best', () => {
    const r = mulberry32(2);
    const P: Pt[] = Array.from({ length: 6 }, () => [r() * 100, r() * 100]);
    const fr = record(tspFrames(P));
    expect(fr.length).toBe(factorial(5));
    const f = fr[fr.length - 1];
    for (const x of fr) expect(f.bestLen).toBeLessThanOrEqual(tourLen(P, x.tour) + 1e-9);
  });
});

describe('karatsuba', () => {
  it('multiplies correctly and uses 3^k base multiplications', () => {
    const r = mulberry32(4);
    for (let t = 0; t < 30; t++) {
      const x = BigInt(Math.floor(r() * 1e8)), y = BigInt(Math.floor(r() * 1e8));
      expect(last(karaFrames(x, y)).calls[0].result).toBe(x * y);
    }
    expect(last(karaFrames(1234n, 5678n)).mults).toBeLessThanOrEqual(9 + 4);
  });
});

describe('closest pair', () => {
  it('matches brute force', () => {
    const r = mulberry32(6);
    for (let t = 0; t < 40; t++) {
      const n = 2 + Math.floor(r() * 40);
      const P: P2[] = Array.from({ length: n }, () => [Math.floor(r() * 200), Math.floor(r() * 200)]);
      let b = Infinity;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) b = Math.min(b, d2(P[i], P[j]));
      const f = last(cpFrames(P));
      expect(f.bestD).toBeCloseTo(b, 9);
      if (n >= 30) expect(f.comps).toBeLessThan((n * (n - 1)) / 2);
    }
  });
});

describe('intervals', () => {
  it('earliest finish is optimal; the others are not always', () => {
    const r = mulberry32(8);
    for (let t = 0; t < 200; t++) {
      const I: Iv[] = Array.from({ length: 8 }, () => { const s = Math.floor(r() * 20); return { s, f: s + 1 + Math.floor(r() * 8) }; });
      const g = last(greedyFrames(I, 'finish'));
      expect(g.chosen.length).toBe(bruteOptimum(I));
      expect(optimum(I)).toBe(bruteOptimum(I));
      for (const a of g.chosen) for (const b of g.chosen) if (a !== b) expect(overlap(I[a], I[b])).toBe(false);
    }
  });
  it('partitioning uses depth rooms and no room has overlaps', () => {
    const r = mulberry32(9);
    for (let t = 0; t < 100; t++) {
      const I: Iv[] = Array.from({ length: 12 }, () => { const s = Math.floor(r() * 30); return { s, f: s + 1 + Math.floor(r() * 10) }; });
      const f = last(partitionFrames(I));
      expect(f.rooms).toBe(depth(I));
      for (let a = 0; a < I.length; a++) for (let b = a + 1; b < I.length; b++) if (f.room[a] === f.room[b]) expect(overlap(I[a], I[b])).toBe(false);
    }
  });
});

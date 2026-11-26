import { describe, expect, it } from 'vitest';
import { rng, type G } from '../src/lib/bookgraphs';
import { APSP_G, JOHNSON_G, floydFrames, floydWithPred, johnsonPrices, pathFrom, shimbelFrames, squaringFrames, weightMatrix } from '../src/lib/apsp';

const ref = (g: G) => g.names.map((_, s) => {
  const n = g.names.length, d = Array(n).fill(Infinity); d[s] = 0;
  for (let i = 0; i < n; i++) for (const [u, v, w] of g.edges) if (d[u] + (w ?? 1) < d[v]) d[v] = d[u] + (w ?? 1);
  return d;
});
const randG = (seed: number): G => {
  const r = rng(seed), n = 2 + Math.floor(r() * 7), edges: [number, number, number][] = [];
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && r() < 0.35) edges.push([u, v, Math.floor(r() * 10) - (u < v ? 3 : 0)]);
  return { names: [...Array(n)].map((_, i) => String(i)), xy: [], edges };
};

describe('apsp', () => {
  it('all four agree with V Bellman–Fords (no negative cycles)', () => {
    for (let t = 0; t <= 80; t++) {
      const g = t === 0 ? APSP_G : randG(t);
      if (johnsonPrices(g) === null) continue;
      const R = ref(g);
      expect(shimbelFrames(g).at(-1)!.D).toEqual(R);
      expect(squaringFrames(g).at(-1)!.D).toEqual(R);
      expect(floydFrames(g).at(-1)!.D).toEqual(R);
      const { D, P } = floydWithPred(g);
      expect(D).toEqual(R);
      const W = weightMatrix(g);
      for (let u = 0; u < D.length; u++) for (let v = 0; v < D.length; v++) {
        const p = pathFrom(P, u, v);
        if (D[u][v] === Infinity) { expect(p).toBe(null); continue; }
        let L = 0; for (let i = 1; i < p!.length; i++) L += W[p![i - 1]][p![i]];
        expect(L).toBe(D[u][v]);
      }
    }
  });
  it('Johnson prices make every edge non-negative', () => {
    const p = johnsonPrices(JOHNSON_G)!;
    for (const [u, v, w] of JOHNSON_G.edges) expect(p[u] + w! - p[v]).toBeGreaterThanOrEqual(0);
    expect(johnsonPrices(APSP_G)).not.toBe(null);
  });
});

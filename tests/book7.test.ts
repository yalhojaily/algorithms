import { describe, expect, it } from 'vitest';
import { WEIGHTED, rng, type G } from '../src/lib/bookgraphs';
import { boruvkaFrames, jarnikFrames, kruskalFrames, shorterEdge, spanningTrees } from '../src/lib/mst';

const randG = (seed: number, distinct = true): G => {
  const r = rng(seed), n = 3 + Math.floor(r() * 6), edges: [number, number, number][] = [];
  for (let v = 1; v < n; v++) edges.push([Math.floor(r() * v), v, 0]);       // connected
  for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (r() < 0.3 && !edges.some(([a, b]) => a === u && b === v)) edges.push([u, v, 0]);
  const ws = distinct ? [...Array(edges.length).keys()].map((i) => i + 1).sort(() => r() - 0.5) : edges.map(() => 1 + Math.floor(r() * 3));
  edges.forEach((e, i) => (e[2] = ws[i]));
  return { names: [...Array(n)].map((_, i) => String(i)), xy: [], edges };
};
const weight = (g: G, F: number[]) => F.reduce((s, k) => s + (g.edges[k][2] ?? 1), 0);

describe('mst', () => {
  it('distinct weights: unique MST, and all three algorithms find it', () => {
    for (let t = 1; t <= 60; t++) {
      const g = t === 1 ? WEIGHTED : randG(t);
      const all = spanningTrees(g), best = Math.min(...all.map((T) => weight(g, T)));
      const mins = all.filter((T) => weight(g, T) === best);
      expect(mins.length).toBe(1);
      const key = mins[0].slice().sort((a, b) => a - b).join();
      for (const f of [boruvkaFrames(g), kruskalFrames(g), jarnikFrames(g)]) expect(f.at(-1)!.F.slice().sort((a, b) => a - b).join()).toBe(key);
    }
  });
  it('Borůvka halves the components each round', () => {
    for (let t = 1; t <= 30; t++) {
      const g = randG(100 + t), rounds = boruvkaFrames(g).at(-1)!.round!;
      expect(rounds).toBeLessThanOrEqual(Math.ceil(Math.log2(g.names.length)));
    }
  });
  it('ShorterEdge is a strict total order', () => {
    const g = randG(7, false), cmp = shorterEdge(g), m = g.edges.length;
    for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) if (a !== b) { expect(cmp(a, b)).not.toBe(0); expect(Math.sign(cmp(a, b))).toBe(-Math.sign(cmp(b, a))); }
  });
});

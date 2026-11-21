import { describe, expect, it } from 'vitest';
import { bipartite, componentIds, degrees, eulerInfo, hierholzer, isTree, type Edge } from '../src/lib/graphs';

const konigsberg: Edge[] = [[0, 2], [0, 2], [1, 2], [1, 2], [0, 3], [1, 3], [2, 3]];
const house: Edge[] = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [2, 4], [3, 4]];
const last = <T,>(g: Generator<T>) => { let x: T | undefined; for (const v of g) x = v; return x!; };

describe('graph basics', () => {
  it('handshake: degree sum is twice the edges', () => {
    expect(degrees(4, konigsberg).reduce((a, b) => a + b)).toBe(14);
  });
  it('Königsberg has no Euler walk; the house has an Euler path', () => {
    expect(eulerInfo(4, konigsberg).kind).toBe('none');
    expect(eulerInfo(5, house)).toMatchObject({ kind: 'path', odd: [0, 1] });
  });
  it('Hierholzer walks every edge exactly once', () => {
    const f = last(hierholzer(5, house, 0));
    expect(f.path.length).toBe(house.length + 1);
    expect(f.used.every(Boolean)).toBe(true);
    const p = f.path;
    const multiset = house.map(([u, v]) => [Math.min(u, v), Math.max(u, v)].join()).sort();
    const walked = p.slice(1).map((v, i) => [Math.min(v, p[i]), Math.max(v, p[i])].join()).sort();
    expect(walked).toEqual(multiset);
  });
  it('components, trees and bipartiteness', () => {
    expect(new Set(componentIds(6, [[0, 1], [1, 2], [3, 4]])).size).toBe(3);
    expect(isTree(4, [[0, 1], [1, 2], [1, 3]])).toBe(true);
    expect(isTree(4, [[0, 1], [1, 2], [2, 0]])).toBe(false);
    expect(bipartite(6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]).ok).toBe(true);
    expect(bipartite(3, [[0, 1], [1, 2], [2, 0]]).ok).toBe(false);
  });
});

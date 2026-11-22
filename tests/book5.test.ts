import { describe, expect, it } from 'vitest';
import { BOOK_G, WEIGHTED, adjOf, floodFrames, gridG, weightOf, wfsFrames } from '../src/lib/bookgraphs';

describe('book graph', () => {
  it('has 13 vertices, 19 edges, two components, and the degrees of Figure 5.11', () => {
    expect(BOOK_G.names.length).toBe(13);
    expect(BOOK_G.edges.length).toBe(19);
    const f = wfsFrames(BOOK_G, 0, 'stack', true).at(-1)!;
    expect(f.count).toBe(2);
    expect(adjOf(BOOK_G).map((l) => l.length)).toEqual([2, 4, 4, 2, 5, 4, 5, 1, 1, 3, 2, 3, 2]);
  });
});

describe('whatever-first search', () => {
  it('marks exactly the component and builds a spanning tree, for every bag', () => {
    for (const bag of ['stack', 'queue', 'prim', 'dijkstra'] as const) {
      const f = wfsFrames(BOOK_G, 0, bag, false).at(-1)!;
      expect(f.marked.length).toBe(9);
      expect(f.parent.filter((p) => p >= 0).length).toBe(8);
    }
  });
  it('BFS gives hop distances; best-first with dist gives Dijkstra distances', () => {
    const g = gridG(5, 5), f = wfsFrames(g, 12, 'queue', false).at(-1)!;
    // depth in the BFS tree = Manhattan distance from the centre
    const depth = (v: number): number => (f.parent[v] < 0 ? 0 : 1 + depth(f.parent[v]));
    for (let v = 0; v < 25; v++) expect(depth(v)).toBe(Math.abs((v / 5 | 0) - 2) + Math.abs(v % 5 - 2));
    const d = wfsFrames(WEIGHTED, 0, 'dijkstra', false).at(-1)!.dist;
    // Bellman-Ford reference
    const n = 9, w = weightOf(WEIGHTED), ref = Array(n).fill(Infinity); ref[0] = 0;
    for (let k = 0; k < n; k++) for (const [u, v] of WEIGHTED.edges) { ref[v] = Math.min(ref[v], ref[u] + w(u, v)); ref[u] = Math.min(ref[u], ref[v] + w(u, v)); }
    expect(d).toEqual(ref);
  });
  it('prim builds the minimum spanning tree', () => {
    const f = wfsFrames(WEIGHTED, 0, 'prim', false).at(-1)!, w = weightOf(WEIGHTED);
    const total = f.parent.reduce((s, p, v) => s + (p >= 0 ? w(p, v) : 0), 0);
    // Kruskal reference
    const e = [...WEIGHTED.edges].sort((a, b) => a[2]! - b[2]!), par = [...Array(9).keys()];
    const find = (x: number): number => (par[x] === x ? x : (par[x] = find(par[x])));
    let ref = 0;
    for (const [u, v, x] of e) if (find(u) !== find(v)) { par[find(u)] = find(v); ref += x!; }
    expect(total).toBe(ref);
  });
});

describe('flood fill', () => {
  it('fills exactly the region', () => {
    const img = [[0, 0, 1], [0, 1, 1], [1, 1, 0]];
    for (const bag of ['stack', 'queue'] as const) {
      const f = floodFrames(img, 0, 0, 2, bag).at(-1)!;
      expect(f.img).toEqual([[2, 2, 1], [2, 1, 1], [1, 1, 0]]);
      expect(f.filled).toBe(3);
    }
  });
});

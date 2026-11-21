import { describe, expect, it } from 'vitest';
import { record } from '../src/engine/stepper';
import { quickFrames } from '../src/lib/quicksort';
import { makeArr } from '../src/lib/sortrace';
import { ALGS, adversary, decisionTree, factorial, lowerBound, mergeWorst, OPTIMAL, perms, treeStats } from '../src/lib/lowerbound';
import { countingFrames, radixFrames } from '../src/lib/linearsort';
import { heapFrames, isMaxHeap } from '../src/lib/heap';

const sorted = (a: number[]) => a.slice().sort((x, y) => x - y);
const last = <T,>(g: Generator<T>) => { const f = record(g, 100000); return f[f.length - 1]; };

describe('quicksort frames', () => {
  it('sorts every input with every scheme and rule', () => {
    for (const kind of ['random', 'sorted', 'reversed', 'nearly', 'few'] as const)
      for (const scheme of ['lomuto', 'three'] as const)
        for (const rule of ['last', 'random', 'median3'] as const)
          for (const n of [1, 2, 5, 16, 24]) {
            const A = makeArr(kind, Math.max(n, 2), n).slice(0, n);
            const f = last(quickFrames(A, scheme, rule));
            expect(f.arr).toEqual(sorted(A));
            expect(f.done).toBe(true);
          }
  });
  it('Lomuto with the last pivot on sorted input is quadratic and deep', () => {
    const A = makeArr('sorted', 20);
    const f = last(quickFrames(A, 'lomuto', 'last'));
    expect(f.comps).toBe((20 * 19) / 2);
    expect(f.maxDepth).toBe(19);
  });
  it('three-way partition is linear on few distinct values', () => {
    const A = makeArr('few', 24, 3);
    expect(last(quickFrames(A, 'three', 'random')).comps).toBeLessThanOrEqual(24 * 3);
  });
});

describe('lower bound', () => {
  it('perms and bounds', () => {
    expect(perms(4).length).toBe(24);
    expect(new Set(perms(4).map((p) => p.join())).size).toBe(24);
    expect([1, 2, 3, 4, 5, 12].map(lowerBound)).toEqual([0, 1, 3, 5, 7, 29]);
    expect([2, 3, 4, 5, 8].map(mergeWorst)).toEqual([1, 3, 5, 8, 17]);
    for (let n = 1; n <= 12; n++) expect(OPTIMAL[n]).toBeGreaterThanOrEqual(lowerBound(n));
  });
  it('decision trees have n! leaves and every leaf is the right order', () => {
    for (const k of ['ins', 'sel', 'merge'] as const) for (const n of [2, 3, 4]) {
      const t = decisionTree(ALGS[k], n);
      const st = treeStats(t);
      expect(st.leaves).toBe(factorial(n));
      expect(st.height).toBeGreaterThanOrEqual(lowerBound(n));
    }
    expect(treeStats(decisionTree(ALGS.ins, 3)).height).toBe(3);
    expect(treeStats(decisionTree(ALGS.sel, 3)).redundant).toBeGreaterThan(0);
    expect(treeStats(decisionTree(ALGS.merge, 4)).height).toBe(5);
  });
  it('the adversary keeps at least half the orders alive', () => {
    let alive = perms(5);
    let q = 0;
    const pairs = [[0, 1], [2, 3], [0, 2], [1, 3], [4, 0], [4, 2], [1, 2], [3, 4], [1, 4], [0, 3]];
    for (const [i, j] of pairs) {
      if (alive.length === 1) break;
      const before = alive.length;
      alive = adversary(alive, i, j).alive;
      expect(alive.length * 2).toBeGreaterThanOrEqual(before);
      q++;
    }
    expect(q).toBeGreaterThanOrEqual(lowerBound(5));
  });
});

describe('linear sorting frames', () => {
  it('counting sort', () => {
    const A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 0];
    const f = last(countingFrames(A, 10));
    expect(f.out).toEqual(sorted(A));
  });
  it('radix sort', () => {
    const A = [329, 457, 657, 839, 436, 720, 355, 8, 91, 700];
    const f = last(radixFrames(A, 3));
    expect(f.arr).toEqual(sorted(A));
  });
});

describe('heap frames', () => {
  it('insert keeps the heap property', () => {
    let h: number[] = [];
    for (const x of [5, 3, 17, 10, 84, 19, 6, 22, 9, 1, 50]) { h = last(heapFrames(h, 'insert', x)).arr; expect(isMaxHeap(h)).toBe(true); }
    const out: number[] = [];
    while (h.length) { out.push(h[0]); h = last(heapFrames(h, 'extract')).arr; expect(isMaxHeap(h)).toBe(true); }
    expect(out).toEqual([84, 50, 22, 19, 17, 10, 9, 6, 5, 3, 1]);
  });
  it('build and sort', () => {
    const A = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7, 12, 15, 11];
    const b = last(heapFrames(A, 'build'));
    expect(isMaxHeap(b.arr)).toBe(true);
    expect(b.comps).toBeLessThanOrEqual(2 * A.length);
    expect(last(heapFrames(A, 'sort')).arr).toEqual(sorted(A));
  });
});

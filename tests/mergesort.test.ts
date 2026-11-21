import { describe, expect, it } from 'vitest';
import { makeInput, mergeSortFrames, mergeWorst, splitTree } from '../src/lib/mergesort';
import { record } from '../src/engine/stepper';
import { mulberry32 } from '../src/lib/montecarlo';

describe('merge sort frames', () => {
  it('sorts, and never exceeds the worst-case comparison bound', () => {
    const r = mulberry32(9);
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(r() * 40);
      const A = Array.from({ length: n }, () => Math.floor(r() * 30));
      const fr = record(mergeSortFrames(A));
      const last = fr[fr.length - 1];
      expect(last.arr).toEqual([...A].sort((a, b) => a - b));
      expect(last.comparisons).toBeLessThanOrEqual(mergeWorst(n));
    }
  });
  it('sorted input uses exactly (n/2)·log₂ n comparisons when n is a power of 2', () => {
    for (const n of [2, 4, 8, 16, 32]) {
      const fr = record(mergeSortFrames(makeInput('sorted', n)));
      expect(fr[fr.length - 1].comparisons).toBe((n / 2) * Math.log2(n));
    }
  });
  it('the split tree has 2n − 1 segments and depth ⌈log₂ n⌉', () => {
    for (const n of [1, 2, 3, 5, 8, 13, 16]) {
      const T = splitTree(n);
      expect(T.length).toBe(2 * n - 1);
      expect(Math.max(...T.map((s) => s.depth))).toBe(Math.ceil(Math.log2(n)));
    }
  });
});

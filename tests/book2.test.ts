import { describe, expect, it } from 'vitest';
import { allQueens, queensFrames } from '../src/lib/queens';
import { apply, makeSolver, moves, start, winner } from '../src/lib/sugar';
import { constructSubset, subsetTree } from '../src/lib/subsetsum';
import { WORDS, segmentFrames, isPalindrome } from '../src/lib/segment';
import { PI_DIGITS, lisTake1, lisTake2, lisWitness } from '../src/lib/lis';
import { backtrackCalls, balancedTree, buildTree, catalan, optTable, treeCost } from '../src/lib/optbst';

describe('n queens', () => {
  it('counts solutions', () => {
    expect([4, 5, 6, 7, 8].map((n) => allQueens(n).length)).toEqual([2, 10, 4, 40, 92]);
    expect(allQueens(4)).toEqual([[2, 4, 1, 3], [3, 1, 4, 2]]);
    expect(allQueens(8)).toContainEqual([5, 7, 1, 4, 2, 8, 6, 3]);   // Gauss's first solution, Figure 2.1
    const f = queensFrames(4, true);
    expect(f[f.length - 1].solutions).toBe(2);
    expect(f[f.length - 1].nodes).toBe(17);   // Figure 2.3 has 17 nodes (root + 16)
  });
});

describe('sugar-packet game', () => {
  it('is always movable for someone, and the first player wins 3×3', () => {
    for (const n of [2, 3]) {
      const seen = new Set<string>(), stack = [start(n, 'H'), start(n, 'V')];
      while (stack.length) {
        const s = stack.pop()!, k = JSON.stringify(s);
        if (seen.has(k) || winner(s)) continue;
        seen.add(k);
        const m = moves(s);
        if (m.length === 0) expect(moves(apply(s, null)).length).toBeGreaterThan(0);
        for (const x of m) stack.push(apply(s, x));
        if (m.length === 0) stack.push(apply(s, null));
      }
    }
    const sv = makeSolver();
    expect(sv.good(start(3, 'H'))).toBe(true);   // the first player can force a win on 3×3
    expect(sv.good(start(1, 'H'))).toBe(false);  // but not on 1×1
  });
});

describe('subset sum', () => {
  it('finds the book examples', () => {
    expect(subsetTree([8, 6, 7, 5, 3, 10, 9], 15, false).root.value).toBe(true);
    expect(subsetTree([11, 6, 5, 1, 7, 13, 12], 15, false).root.value).toBe(false);
    const X = [8, 6, 7, 5, 3, 10, 9], s = constructSubset(X, X.length, 15)!;
    expect(s.reduce((a, i) => a + X[i - 1], 0)).toBe(15);
    expect(subsetTree([1, 2, 3], 100, false).count).toBe(15);   // complete binary tree of depth 3
  });
});

describe('segmentation', () => {
  it('finds the two book segmentations among others', () => {
    const r = segmentFrames('bothearthandsaturnspin', (w) => WORDS.includes(w), true);
    const s = r.solutions.map((x) => x.join('·'));
    expect(s).toContain('both·earth·and·saturn·spin');
    expect(s).toContain('bot·heart·hands·at·urns·pin');
    expect(segmentFrames('rotator', isPalindrome, true).solutions.length).toBeGreaterThan(1);
  });
});

describe('LIS', () => {
  it('both strategies agree with the table', () => {
    for (let t = 0; t < 30; t++) {
      const A = Array.from({ length: 1 + Math.floor(Math.random() * 12) }, () => Math.floor(Math.random() * 10));
      expect(lisTake1(A).len).toBe(lisWitness(A).length);
      expect(lisTake2(A).len).toBe(lisWitness(A).length);
    }
    expect(lisWitness(PI_DIGITS).length).toBe(lisTake2(PI_DIGITS.slice(0, 23)).len);
  });
});

describe('optimal BST', () => {
  it('beats or ties the balanced tree, and counts match the recurrences', () => {
    const f = [5, 8, 2, 1, 9, 5, 3];
    const t = optTable(f), opt = buildTree(t, 0, f.length - 1);
    expect(treeCost(opt, f)).toBe(t.get(0, f.length - 1).cost);
    expect(t.get(0, f.length - 1).cost).toBeLessThanOrEqual(treeCost(balancedTree(0, f.length - 1), f));
    expect([0, 1, 2, 3, 4, 5].map(catalan)).toEqual([1, 1, 2, 5, 14, 42]);
    expect(backtrackCalls(1)).toBe(3);
  });
});

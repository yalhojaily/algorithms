import { describe, expect, it } from 'vitest';
import { DREAM, editPath, editTable, fibTree, greedyBills, lisFirstFrames, minBillsTable, optBSTFrames, randomTree, splitTableFrames, subsetTable, treeMISFrames } from '../src/lib/dp';

const F = (n: number) => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };

describe('fibonacci trees', () => {
  it('RecFibo has 2F(n+1) − 1 nodes; MemFibo has 2n − 1', () => {
    for (let n = 2; n <= 12; n++) {
      expect(fibTree(n, false).nodes.length).toBe(2 * F(n + 1) - 1);
      expect(fibTree(n, true).nodes.length).toBe(2 * n - 1);
    }
  });
});

describe('split table', () => {
  it('matches the backtracking answer and makes n(n+1)/2 IsWord calls', () => {
    const W = new Set(['both', 'earth', 'and', 'saturn', 'spin', 'bot', 'heart', 'hands', 'at', 'urns', 'pin']);
    const f = splitTableFrames('bothearthandsaturnspin', (w) => W.has(w));
    const last = f[f.length - 1];
    expect(last.table[1]).toBe(true);
    expect(last.isWordCalls).toBe((22 * 23) / 2);
    expect(splitTableFrames('xyz', (w) => W.has(w)).at(-1)!.table[1]).toBe(false);
  });
});

describe('change making', () => {
  it('greedy fails for Dream-Dollars, the table does not', () => {
    const { M, bills } = minBillsTable(800);
    let bad = 0;
    for (let k = 1; k <= 800; k++) {
      expect(bills(k).reduce((a, b) => a + b, 0)).toBe(k);
      if (greedyBills(k).length > M[k]) bad++;
    }
    expect(bad).toBeGreaterThan(0);
    expect(DREAM.length).toBe(8);
  });
});

describe('LISfirst table', () => {
  it('agrees with the quadratic definition', () => {
    for (let t = 0; t < 40; t++) {
      const A = Array.from({ length: Math.floor(Math.random() * 12) }, () => Math.floor(Math.random() * 9));
      const L = A.map(() => 1);
      for (let i = 0; i < A.length; i++) for (let j = 0; j < i; j++) if (A[j] < A[i]) L[i] = Math.max(L[i], L[j] + 1);
      expect(lisFirstFrames(A).at(-1)!.best).toBe(Math.max(0, ...L));
    }
  });
});

describe('edit distance', () => {
  it('ALGORITHM vs ALTRUISTIC is 6, FOOD vs MONEY is 4, and the path is consistent', () => {
    const E = editTable('ALGORITHM', 'ALTRUISTIC');
    expect(E[9][10]).toBe(6);
    expect(editTable('FOOD', 'MONEY')[4][5]).toBe(4);
    const p = editPath('ALGORITHM', 'ALTRUISTIC', E);
    const cost = p.top.filter((c, k) => c !== p.bot[k]).length;
    expect(cost).toBe(6);
    expect(p.top.join('').replace(/ /g, '')).toBe('ALGORITHM');
    expect(p.bot.join('').replace(/ /g, '')).toBe('ALTRUISTIC');
  });
});

describe('subset sum table', () => {
  it('book examples and recovery', () => {
    const X = [8, 6, 7, 5, 3, 10, 9];
    const s = subsetTable(X, 15);
    expect(s.S[1][15]).toBe(true);
    expect(s.recover()!.reduce((a, i) => a + X[i - 1], 0)).toBe(15);
    expect(subsetTable([11, 6, 5, 1, 7, 13, 12], 15).S[1][15]).toBe(false);
  });
});

describe('optimal BST table', () => {
  it('all three orders give the same answer', () => {
    const f = [5, 8, 2, 1, 9, 5, 3];
    const ans = (['diag', 'rows', 'cols'] as const).map((o) => optBSTFrames(f, o).at(-1)!.C[1][7]);
    expect(new Set(ans).size).toBe(1);
    expect(optBSTFrames([3, 1, 2], 'diag').at(-1)!.C[1][3]).toBe(10);
  });
});

describe('tree MIS', () => {
  it('chosen set is independent and has the optimal size', () => {
    for (let seed = 1; seed < 30; seed++) {
      const { nodes } = randomTree(14, seed);
      const { frames, chosen } = treeMISFrames(nodes);
      const last = frames.at(-1)!;
      expect(chosen.size).toBe(Math.max(last.yes[0]!, last.no[0]!));
      for (const v of chosen) expect(chosen.has(nodes[v].parent)).toBe(false);
      // brute force on 14 nodes
      let best = 0;
      for (let m = 0; m < 1 << 14; m++) {
        let ok = true, c = 0;
        for (let v = 0; v < 14 && ok; v++) if (m >> v & 1) { c++; const p = nodes[v].parent; if (p >= 0 && m >> p & 1) ok = false; }
        if (ok) best = Math.max(best, c);
      }
      expect(chosen.size).toBe(best);
    }
  });
});

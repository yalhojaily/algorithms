import { describe, expect, it } from 'vitest';
import { REC_PROGRAMS, maxDepth, replay } from '../src/lib/recursion';

const P = (k: string) => REC_PROGRAMS.find((p) => p.key === k)!;

describe('recursion traces', () => {
  it('factorial: n + 1 calls, depth n + 1, right value', () => {
    for (let n = 0; n <= 8; n++) {
      const t = P('fact').run(n);
      expect(t.nodes.length).toBe(n + 1);
      expect(maxDepth(t)).toBe(n + 1);
      expect(Number(t.result)).toBe([1, 1, 2, 6, 24, 120, 720, 5040, 40320][n]);
    }
  });
  it('fast power: ⌊log₂ n⌋ + 2 calls for n ≥ 1, exact value', () => {
    for (let n = 1; n <= 64; n++) {
      const t = P('pow').run(n);
      expect(t.nodes.length).toBe(Math.floor(Math.log2(n)) + 2);
      expect(t.result).toBe(String(2n ** BigInt(n)));
    }
  });
  it('naive fibonacci: 2·F(n+1) − 1 calls', () => {
    const F = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
    for (let n = 0; n <= 8; n++) {
      const t = P('fib').run(n);
      expect(t.nodes.length).toBe(2 * F[n + 1] - 1);
      expect(Number(t.result)).toBe(F[n]);
    }
  });
  it('hanoi: 2^n − 1 moves and 2^(n+1) − 1 calls', () => {
    for (let n = 0; n <= 4; n++) {
      const t = P('hanoi').run(n);
      expect(t.result).toBe(`${2 ** n - 1} نقلة`);
      expect(t.nodes.length).toBe(2 ** (n + 1) - 1);
    }
  });
  it('replay: the stack is empty at the end and matches depth on every call', () => {
    for (const p of REC_PROGRAMS) {
      const t = p.run(p.start);
      const fr = replay(t);
      expect(fr.length).toBe(2 * t.nodes.length);
      expect(fr[fr.length - 1].stack.length).toBe(0);
      for (const f of fr) if (f.event.type === 'call') expect(f.stack.length).toBe(t.nodes[f.active].depth + 1);
    }
  });
});

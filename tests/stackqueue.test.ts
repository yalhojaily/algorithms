import { describe, expect, it } from 'vitest';
import { cqDequeue, cqEnqueue, cqNew, isBalanced, postfixFrames } from '../src/lib/stackqueue';
import { record } from '../src/engine/stepper';

describe('stacks and queues', () => {
  it('circular queue behaves like a FIFO queue through wrap-around and resizing', () => {
    let q = cqNew();
    const model: number[] = [];
    let x = 0;
    for (let t = 0; t < 2000; t++) {
      if (Math.random() < 0.55) { q = cqEnqueue(q, ++x); model.push(x); }
      else if (model.length) { const want = model.shift(); const got = q.a[q.head]; expect(got).toBe(want); q = cqDequeue(q); }
      expect(q.n).toBe(model.length);
      for (let k = 0; k < q.n; k++) expect(q.a[(q.head + k) % q.a.length]).toBe(model[k]);
      expect(q.a.length).toBeGreaterThanOrEqual(q.n);
    }
  });
  it('brackets', () => {
    expect(isBalanced('{[()()]}')).toBe(true);
    expect(isBalanced('a*(b+c)-{d/[e]}')).toBe(true);
    expect(isBalanced('([)]')).toBe(false);
    expect(isBalanced('(()')).toBe(false);
    expect(isBalanced('())')).toBe(false);
    expect(isBalanced('')).toBe(true);
  });
  it('postfix', () => {
    const f = record(postfixFrames('3 4 + 2 * 7 -'.split(' ')));
    expect(f[f.length - 1].stack).toEqual([7]);
    const g = record(postfixFrames('5 1 2 + 4 * + 3 -'.split(' ')));
    expect(g[g.length - 1].stack).toEqual([14]);
  });
});

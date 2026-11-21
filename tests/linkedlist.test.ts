import { describe, expect, it } from 'vitest';
import { LL_PROGRAMS, walk } from '../src/lib/linkedlist';
import { record } from '../src/engine/stepper';

const P = (k: string) => LL_PROGRAMS.find((p) => p.key === k)!;
const last = (k: string) => { const fr = record(P(k).run()); return fr[fr.length - 1]; };

describe('linked list programs', () => {
  it('reverse: the list read from prev is reversed', () => {
    const f = last('rev');
    expect(walk(f.next, f.ptrs.prev).map((i) => P('rev').nodes[i].val)).toEqual(['6', '4', '9', '1', '7', '3']);
  });
  it('middle of 7 nodes is node 3', () => {
    expect(last('mid').ptrs.slow).toBe(3);
  });
  it('Floyd finds the start of the cycle', () => {
    expect(last('cycle').ptrs.slow).toBe(3);
  });
  it('delete-all removes every 4', () => {
    const f = last('del');
    expect(walk(f.next, f.next[0]).map((i) => P('del').nodes[i].val)).toEqual(['2', '7']);
  });
  it('merge produces 1 2 3 4 7 8 9', () => {
    const f = last('merge');
    expect(walk(f.next, f.next[0]).map((i) => P('merge').nodes[i].val)).toEqual(['1', '2', '3', '4', '7', '8', '9']);
  });
});

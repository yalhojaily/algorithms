import { describe, expect, it } from 'vitest';
import { record } from '../src/engine/stepper';
import { avlFrames, avlInsert, bstFrames, bstInsert, height, inorder, isAVL, size, type TNode } from '../src/lib/bst';
import { apply, init, maxDepth, rootOf, ufFrames } from '../src/lib/unionfind';
import { mulberry32 } from '../src/lib/montecarlo';

const last = <T,>(g: Generator<T>) => { const f = record(g, 100000); return f[f.length - 1]; };
const build = (keys: number[]) => keys.reduce<TNode | null>((t, k) => bstInsert(t, k), null);

describe('BST frames', () => {
  it('insert, search, delete keep the BST order', () => {
    const r = mulberry32(3);
    for (let t = 0; t < 40; t++) {
      const keys = Array.from({ length: 20 }, () => Math.floor(r() * 50));
      let root: TNode | null = null;
      for (const k of keys) root = last(bstFrames(root, 'insert', k)).root;
      const set = [...new Set(keys)].sort((a, b) => a - b);
      expect(inorder(root)).toEqual(set);
      for (const k of [0, 7, 25, 49]) expect(last(bstFrames(root, 'search', k)).note.startsWith('وجدنا')).toBe(set.includes(k));
      for (const k of keys.slice(0, 10)) {
        root = last(bstFrames(root, 'delete', k)).root;
        set.splice(set.indexOf(k), set.includes(k) ? 1 : 0);
        expect(inorder(root)).toEqual(set);
        expect(root ? root.h : 0).toBe(height(root));
      }
    }
  });
  it('in-order traversal outputs sorted keys', () => {
    const root = build([8, 3, 10, 1, 6, 14, 4, 7, 13]);
    expect(last(bstFrames(root, 'inorder')).out).toEqual([1, 3, 4, 6, 7, 8, 10, 13, 14]);
  });
});

describe('AVL', () => {
  it('stays balanced on sorted input and matches the frame version', () => {
    let a: TNode | null = null, f: TNode | null = null;
    for (let k = 1; k <= 31; k++) {
      a = avlInsert(a, k);
      f = last(avlFrames(f, k)).root;
      expect(isAVL(a)).toBe(true);
      expect(inorder(f)).toEqual(inorder(a));
      expect(height(f)).toBe(height(a));
    }
    expect(height(a)).toBe(5);
    expect(height(build(Array.from({ length: 31 }, (_, i) => i + 1)))).toBe(31);
  });
  it('random inserts', () => {
    const r = mulberry32(9);
    let f: TNode | null = null;
    for (let t = 0; t < 200; t++) { f = last(avlFrames(f, Math.floor(r() * 1000))).root; expect(isAVL(f)).toBe(true); }
    expect(height(f)).toBeLessThanOrEqual(Math.ceil(1.45 * Math.log2(size(f) + 2)));
  });
  it('all four rotation cases occur', () => {
    const kinds = new Set<string>();
    for (const seq of [[3, 2, 1], [1, 2, 3], [3, 1, 2], [1, 3, 2]]) {
      let t: TNode | null = null;
      for (const k of seq) for (const fr of record(avlFrames(t, k))) { if (fr.rot) kinds.add(fr.rot); t = fr.root; }
      expect(height(t)).toBe(2);
    }
    expect([...kinds].sort()).toEqual(['LL', 'LR', 'RL', 'RR']);
  });
});

describe('union-find', () => {
  it('chain without heuristics is deep, with them shallow', () => {
    for (const [o, deep] of [[{ byRank: false, compress: false }, 11], [{ byRank: true, compress: false }, 1]] as const) {
      let s = init(12);
      for (let i = 0; i < 11; i++) s = apply(s, 'union', i + 1, i, o);
      expect(maxDepth(s)).toBe(deep);
    }
    let s = init(12);
    const o = { byRank: false, compress: true };
    for (let i = 0; i < 11; i++) s = apply(s, 'union', i + 1, i, o);
    s = apply(s, 'find', 0, 0, o);
    expect(maxDepth(s)).toBe(1);
  });
  it('components match a brute-force labelling', () => {
    const r = mulberry32(5);
    for (const o of [{ byRank: true, compress: true }, { byRank: false, compress: false }]) {
      let s = init(20);
      const lab = Array.from({ length: 20 }, (_, i) => i);
      for (let t = 0; t < 25; t++) {
        const a = Math.floor(r() * 20), b = Math.floor(r() * 20);
        s = apply(s, 'union', a, b, o);
        const la = lab[a], lb = lab[b];
        for (let i = 0; i < 20; i++) if (lab[i] === lb) lab[i] = la;
        for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) expect(rootOf(s, i) === rootOf(s, j)).toBe(lab[i] === lab[j]);
      }
      if (o.byRank) expect(maxDepth(s)).toBeLessThanOrEqual(Math.floor(Math.log2(20)));
    }
    expect(last(ufFrames(init(3), 'union', 0, 0, { byRank: true, compress: true })).done).toBe(true);
  });
});

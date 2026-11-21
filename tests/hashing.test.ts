import { describe, expect, it } from 'vitest';
import { TOMB, chainBuild, makeHash, oaDelete, oaFind, oaInsert, probeSeq, stringCode, type Cell } from '../src/lib/hashing';
import { mulberry32 } from '../src/lib/montecarlo';

describe('hashing', () => {
  it('string codes are deterministic and spread', () => {
    expect(stringCode('abc')).toBe(stringCode('abc'));
    const s = new Set(['cat', 'act', 'tac', 'dog', 'god'].map((w) => stringCode(w)));
    expect(s.size).toBe(5);
  });
  it('k mod m is terrible for multiples of m; universal hashing spreads them', () => {
    const keys = Array.from({ length: 64 }, (_, i) => i * 16);
    const bad = chainBuild(keys, 16, makeHash('mod'), false);
    expect(Math.max(...bad.buckets.map((b) => b.length))).toBe(64);
    const good = chainBuild(keys, 16, makeHash('universal', 7), false);
    expect(Math.max(...good.buckets.map((b) => b.length))).toBeLessThan(16);
  });
  it('chaining with growth keeps n ≤ m and stores every key once', () => {
    const r = mulberry32(3);
    const keys = Array.from({ length: 500 }, () => Math.floor(r() * 5000));
    const t = chainBuild(keys, 4, makeHash('universal', 2), true);
    expect(t.n).toBe(new Set(keys).size);
    expect(t.n).toBeLessThanOrEqual(t.m);
    expect(t.buckets.flat().length).toBe(t.n);
  });
  it('probe sequences visit every slot (m = 16, odd step for double hashing)', () => {
    const fn = makeHash('universal', 4);
    for (const p of ['linear', 'quadratic'] as const) for (let k = 0; k < 40; k++) expect(new Set(probeSeq(k, 16, p, fn)).size).toBe(16);
    for (let k = 0; k < 40; k++) expect(new Set(probeSeq(k, 16, 'double', fn)).size).toBe(16);
    for (let k = 0; k < 40; k++) expect(new Set(probeSeq(k, 17, 'double', fn)).size).toBe(17);
  });
  it('open addressing: insert, find, delete with tombstones, reinsert', () => {
    const fn = makeHash('universal', 9);
    for (const p of ['linear', 'quadratic', 'double'] as const) {
      let t: Cell[] = Array(16).fill(null);
      const keys = [3, 19, 35, 51, 7, 23];
      for (const k of keys) t = oaInsert(t, k, p, fn).table;
      for (const k of keys) expect(oaFind(t, k, p, fn).found).toBe(true);
      t = oaDelete(t, 19, p, fn).table;
      expect(t.includes(TOMB)).toBe(true);
      expect(oaFind(t, 19, p, fn).found).toBe(false);
      for (const k of [3, 35, 51, 7, 23]) expect(oaFind(t, k, p, fn).found).toBe(true);
      t = oaInsert(t, 19, p, fn).table;
      expect(oaFind(t, 19, p, fn).found).toBe(true);
    }
  });
});

// Hash functions and hash tables (chaining and open addressing) for lessons 2.5 and 2.6.

import { mulberry32 } from './montecarlo';

export const P = 1_000_003; // a prime larger than every key we use

export type Key = number | string;

/** Polynomial string hash: h = (c0·B^(L−1) + … + c_{L−1}) mod P, by Horner's rule. */
export function stringCode(s: string, B = 31): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * B + s.charCodeAt(i)) % P;
  return h;
}

export const codeOf = (k: Key) => (typeof k === 'number' ? k : stringCode(k));

export type HashKind = 'mod' | 'universal' | 'first';

export interface HashFn { kind: HashKind; a: number; b: number; h: (k: Key, m: number) => number }

export function makeHash(kind: HashKind, seed = 1): HashFn {
  const r = mulberry32(seed);
  const a = 1 + Math.floor(r() * (P - 1)), b = Math.floor(r() * P);
  const h = (k: Key, m: number) => {
    if (kind === 'first') return typeof k === 'string' ? (k.charCodeAt(0) || 0) % m : Math.floor(Number(k) / 1000) % m;
    const c = codeOf(k);
    if (kind === 'mod') return c % m;
    // ((a·k + b) mod p) mod m, without overflow: a, k < 2^20, so a·k < 2^40 is exact in doubles
    return ((a * c + b) % P) % m;
  };
  return { kind, a, b, h };
}

// ---------- Chaining ----------
export interface ChainTable { m: number; buckets: Key[][]; n: number; rehashes: number }

export function chainBuild(keys: Key[], m0: number, fn: HashFn, grow: boolean): ChainTable {
  let m = m0, buckets: Key[][] = Array.from({ length: m }, () => []), n = 0, rehashes = 0;
  for (const k of keys) {
    const b = buckets[fn.h(k, m)];
    if (b.includes(k)) continue;
    b.push(k); n++;
    if (grow && n > m) {
      m *= 2; rehashes++;
      const nb: Key[][] = Array.from({ length: m }, () => []);
      for (const bucket of buckets) for (const x of bucket) nb[fn.h(x, m)].push(x);
      buckets = nb;
    }
  }
  return { m, buckets, n, rehashes };
}

/** Poisson probability that a chain has length j when the load is α. */
export function poisson(alpha: number, j: number) {
  let p = Math.exp(-alpha);
  for (let i = 1; i <= j; i++) p *= alpha / i;
  return p;
}

// ---------- Open addressing ----------
export type Probe = 'linear' | 'quadratic' | 'double';
export const EMPTY = null;
export const TOMB = '†';
export type Cell = Key | null | typeof TOMB;

export function probeSeq(k: Key, m: number, probe: Probe, fn: HashFn): number[] {
  const h1 = fn.h(k, m);
  // double hashing: the step must be coprime with m. For even m (a power of 2) use an odd step.
  const h2 = m % 2 === 0 ? 2 * (codeOf(k) % (m >> 1)) + 1 : 1 + (codeOf(k) % (m - 1));
  const seq: number[] = [];
  for (let i = 0; i < m; i++) {
    if (probe === 'linear') seq.push((h1 + i) % m);
    else if (probe === 'quadratic') seq.push((h1 + (i * (i + 1)) / 2) % m); // triangular numbers: a permutation when m is a power of 2
    else seq.push((h1 + i * h2) % m);
  }
  return seq;
}

export interface OAResult { table: Cell[]; path: number[]; found: boolean; placed?: number }

export function oaInsert(table0: Cell[], k: Key, probe: Probe, fn: HashFn): OAResult {
  const table = table0.slice();
  const m = table.length;
  const seq = probeSeq(k, m, probe, fn);
  const path: number[] = [];
  let firstTomb = -1;
  for (const i of seq) {
    path.push(i);
    if (table[i] === EMPTY) { const at = firstTomb >= 0 ? firstTomb : i; table[at] = k; return { table, path, found: false, placed: at }; }
    if (table[i] === TOMB) { if (firstTomb < 0) firstTomb = i; continue; }
    if (table[i] === k) return { table, path, found: true };
  }
  if (firstTomb >= 0) { table[firstTomb] = k; return { table, path, found: false, placed: firstTomb }; }
  return { table, path, found: false };
}

export function oaFind(table: Cell[], k: Key, probe: Probe, fn: HashFn): OAResult {
  const seq = probeSeq(k, table.length, probe, fn);
  const path: number[] = [];
  for (const i of seq) {
    path.push(i);
    if (table[i] === EMPTY) return { table, path, found: false };
    if (table[i] === k) return { table, path, found: true };
  }
  return { table, path, found: false };
}

export function oaDelete(table0: Cell[], k: Key, probe: Probe, fn: HashFn): OAResult {
  const r = oaFind(table0, k, probe, fn);
  if (!r.found) return r;
  const table = table0.slice();
  table[r.path[r.path.length - 1]] = TOMB;
  return { table, path: r.path, found: true };
}

/** Theoretical expected probes (Knuth): linear probing and uniform hashing. */
export const theory = {
  linearHit: (a: number) => 0.5 * (1 + 1 / (1 - a)),
  linearMiss: (a: number) => 0.5 * (1 + 1 / (1 - a) ** 2),
  uniformHit: (a: number) => (a === 0 ? 1 : (1 / a) * Math.log(1 / (1 - a))),
  uniformMiss: (a: number) => 1 / (1 - a),
};

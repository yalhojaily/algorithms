import { describe, expect, it } from 'vitest';
import { rng } from '../src/lib/bookgraphs';
import {
  BOOK_3CNF, BOOK_CIRCUIT, CLAUSE_GADGET, SMALL_G, SS_G, bitsOf, clauseTrue, complement, evalCircuit, extendGadget, hamCycleFor, hamFromSat,
  indSetGraph, isIndependent, maxIndependentBrute, satisfyingAssignments, satisfyingInputs, subsetSumFromVC, tseitin, type CNF, type Circuit, type Color,
} from '../src/lib/nphard';

const randCircuit = (seed: number): Circuit => {
  const r = rng(seed), n = 1 + Math.floor(r() * 3), gates: Circuit['gates'] = [];
  const m = 1 + Math.floor(r() * 4);
  for (let g = 0; g < m; g++) {
    const W = n + g, pick = () => Math.floor(r() * W), op = (['and', 'or', 'not'] as const)[Math.floor(r() * 3)];
    gates.push({ op, ins: op === 'not' ? [pick()] : [pick(), pick(), ...(r() < 0.3 ? [pick()] : [])], name: g === m - 1 ? 'z' : `y${g + 1}` });
  }
  return { n, inputs: [...Array(n)].map((_, i) => `x${i + 1}`), gates };
};
const cnfSat = (vars: number, clauses: { clause: { v: number; neg: boolean }[] }[]) => {
  // simple backtracking with clause pruning
  const a: (boolean | null)[] = Array(vars).fill(null);
  const ok = () => clauses.every(({ clause }) => clause.some((l) => a[l.v] === null || a[l.v] !== l.neg));
  const go = (i: number): boolean => { if (!ok()) return false; if (i === vars) return true; for (const b of [false, true]) { a[i] = b; if (go(i + 1)) return true; } a[i] = null; return false; };
  return go(0);
};
const randCNF = (seed: number, nv = 3, nc = 3): CNF => {
  const r = rng(seed), vars = 'abcd'.slice(0, 1 + Math.floor(r() * nv) + 1).split('');
  const k = 1 + Math.floor(r() * nc);
  return { vars, clauses: [...Array(k)].map(() => [...Array(3)].map(() => ({ v: Math.floor(r() * vars.length), neg: r() < 0.5 }))) };
};

describe('circuits and Tseitin', () => {
  it('the book circuit is satisfiable, e.g. x2 = x3 = 1, x4 = x5 = 0', () => {
    expect(evalCircuit(BOOK_CIRCUIT, [false, true, true, false, false]).at(-1)).toBe(true);
    expect(satisfyingInputs(BOOK_CIRCUIT).length).toBeGreaterThan(0);
  });
  it('the 3CNF has exactly three literals per clause and is satisfiable iff the circuit is', () => {
    const t = tseitin(BOOK_CIRCUIT);
    expect(t.cnf3.every(({ clause }) => clause.length === 3)).toBe(true);
    expect(t.vars.filter((v) => v.startsWith('p')).length).toBe(20);
    for (let s = 1; s <= 80; s++) {
      const c = randCircuit(s), tt = tseitin(c);
      expect(cnfSat(tt.vars.length, tt.cnf3)).toBe(satisfyingInputs(c).length > 0);
      // the canonical extension satisfies stage 2 for every input that turns the light on
      for (const x of satisfyingInputs(c)) { const w = evalCircuit(tt.bin, x); expect(tt.cnf2.every(({ clause }) => clauseTrue(clause, w))).toBe(true); }
    }
  });
});

describe('3SAT → independent set, coloring, Hamiltonian cycle', () => {
  it('largest independent set = k iff satisfiable', () => {
    expect(maxIndependentBrute(indSetGraph(BOOK_3CNF))).toBe(4);
    for (let s = 1; s <= 60; s++) {
      const f = randCNF(s), g = indSetGraph(f);
      expect(maxIndependentBrute(g) === f.clauses.length).toBe(satisfyingAssignments(f).length > 0);
    }
  });
  it('the clause gadget extends unless all three literals are False', () => {
    for (let m = 0; m < 8; m++) {
      const lits = bitsOf(m, 3).map((b) => (b ? 0 : 1)) as Color[];
      const col = extendGadget(lits);
      if (m === 0) expect(col).toBeNull(); else { expect(col).not.toBeNull(); expect(CLAUSE_GADGET.edges.every(([u, v]) => col![u] !== col![v])).toBe(true); }
    }
  });
  it('the Hamiltonian cycle for a satisfying assignment uses only edges of H and visits every vertex once', () => {
    for (let s = 0; s <= 40; s++) {
      const f = s === 0 ? BOOK_3CNF : randCNF(s);
      if (f.vars.length < 2) continue;
      const H = hamFromSat(f), has = new Set(H.edges.map(([u, v]) => `${u},${v}`));
      for (const a of satisfyingAssignments(f)) {
        const c = hamCycleFor(f, a)!;
        expect(new Set(c).size).toBe(H.V); expect(c.length).toBe(H.V);
        c.forEach((u, i) => expect(has.has(`${u},${c[(i + 1) % c.length]}`)).toBe(true));
      }
    }
  });
});

describe("the book's Hamiltonian construction needs separators", () => {
  const ham = (V: number, E: [number, number][]) => {
    const out: number[][] = [...Array(V)].map(() => []); for (const [u, v] of E) out[u].push(v);
    const seen = Array(V).fill(false); seen[0] = true;
    const go = (u: number, d: number): boolean => { if (d === V) return out[u].includes(0); for (const v of out[u]) if (!seen[v]) { seen[v] = true; if (go(v, d + 1)) return true; seen[v] = false; } return false; };
    return go(0, 1);
  };
  const all8: CNF = { vars: ['a', 'b', 'c'], clauses: [...Array(8)].map((_, m) => [0, 1, 2].map((v) => ({ v, neg: !!((m >> v) & 1) }))) };
  it('an unsatisfiable formula gets a Hamiltonian cycle with 2k + 1 vertices per row, but not with separators', () => {
    expect(satisfyingAssignments(all8).length).toBe(0);
    const B = hamFromSat(all8, true), S = hamFromSat(all8);
    expect(ham(B.V, B.edges)).toBe(true);
    expect(ham(S.V, S.edges)).toBe(false);
  });
});

describe('graphs and subset sum', () => {
  it('complements: independent in G ⇔ clique in Ḡ ⇔ complement is a cover', () => {
    const C = complement(SMALL_G), n = 7;
    expect(maxIndependentBrute(SMALL_G)).toBe(3);
    for (let m = 0; m < 1 << n; m++) {
      const S = new Set([...Array(n)].map((_, i) => i).filter((i) => (m >> i) & 1));
      const clique = [...S].every((u) => [...S].every((v) => u === v || C.edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u))));
      const cover = SMALL_G.edges.every(([u, v]) => !S.has(u) || !S.has(v));
      expect(isIndependent(SMALL_G, S)).toBe(clique); expect(isIndependent(SMALL_G, S)).toBe(cover);
    }
  });
  it("the book's base-4 example", () => {
    const { a, b, T } = subsetSumFromVC(SS_G, 2);
    expect(a).toEqual([1344, 1300, 1105, 1029]); expect(b).toEqual([256, 64, 16, 4, 1]); expect(T).toBe(2730);
    expect(a[1] + a[2] + b[0] + b[1] + b[3] + b[4]).toBe(T);
  });
});

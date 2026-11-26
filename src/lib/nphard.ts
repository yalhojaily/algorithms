// Book chapter 12: NP-hardness — circuits, formulas and the classic reductions.
import type { G } from './bookgraphs';

// ---------- circuits ----------
export type Op = 'and' | 'or' | 'not';
export interface Gate { op: Op; ins: number[]; name: string }
/** Wires 0 … n−1 are the inputs; gate g drives wire n + g; the last gate is the output. */
export interface Circuit { n: number; inputs: string[]; gates: Gate[] }

/** The circuit of Figures 12.2 and 12.5. */
export const BOOK_CIRCUIT: Circuit = {
  n: 5, inputs: ['x1', 'x2', 'x3', 'x4', 'x5'],
  gates: [
    { op: 'and', ins: [0, 3], name: 'y1' },
    { op: 'not', ins: [3], name: 'y2' },
    { op: 'and', ins: [2, 6], name: 'y3' },
    { op: 'or', ins: [5, 1], name: 'y4' },
    { op: 'not', ins: [1], name: 'y5' },
    { op: 'not', ins: [4], name: 'y6' },
    { op: 'or', ins: [7, 9], name: 'y7' },
    { op: 'and', ins: [8, 11, 10], name: 'z' },
  ],
};
export const wireName = (c: Circuit, w: number) => (w < c.n ? c.inputs[w] : c.gates[w - c.n].name);
export function evalCircuit(c: Circuit, x: boolean[]): boolean[] {
  const w = [...x];
  for (const g of c.gates) {
    const v = g.ins.map((i) => w[i]);
    w.push(g.op === 'and' ? v.every(Boolean) : g.op === 'or' ? v.some(Boolean) : !v[0]);
  }
  return w;
}
export const bitsOf = (m: number, n: number) => [...Array(n)].map((_, i) => !!((m >> i) & 1));
export function satisfyingInputs(c: Circuit): boolean[][] {
  const out: boolean[][] = [];
  for (let m = 0; m < 1 << c.n; m++) { const x = bitsOf(m, c.n); if (evalCircuit(c, x).at(-1)) out.push(x); }
  return out;
}

// ---------- CNF ----------
/** A literal: variable index and sign. */
export interface Lit { v: number; neg: boolean }
export type Clause = Lit[];
export interface CNF { vars: string[]; clauses: Clause[] }
export const litTrue = (l: Lit, a: boolean[]) => a[l.v] !== l.neg;
export const clauseTrue = (c: Clause, a: boolean[]) => c.some((l) => litTrue(l, a));

/** Tseitin's reduction in the book's stages: binary gates, one equation per gate, CNF, then exactly three literals per clause. */
export function tseitin(c: Circuit) {
  // stage 1: binary gates (left-deep tree, new wires named after the book: y8, y9, …)
  const gates: Gate[] = [], map: number[] = [...Array(c.n)].map((_, i) => i);
  let extra = c.gates.filter((g) => g.name.startsWith('y')).length;
  c.gates.forEach((g, gi) => {
    let ins = g.ins.map((i) => map[i]);
    while (ins.length > 2) {
      gates.push({ op: g.op, ins: [ins[0], ins[1]], name: `y${++extra}` });
      ins = [c.n + gates.length - 1, ...ins.slice(2)];
    }
    gates.push({ op: g.op, ins, name: g.name });
    map[c.n + gi] = c.n + gates.length - 1;
  });
  const bin: Circuit = { n: c.n, inputs: c.inputs, gates };
  // stage 2–3: clauses per gate
  const vars = [...c.inputs, ...gates.map((g) => g.name)];
  const L = (v: number, neg = false): Lit => ({ v, neg });
  const cnf2: { clause: Clause; gate: number }[] = [];
  gates.forEach((g, gi) => {
    const a = c.n + gi, [b, d] = g.ins;
    if (g.op === 'and') [[L(a), L(b, true), L(d, true)], [L(a, true), L(b)], [L(a, true), L(d)]].forEach((cl) => cnf2.push({ clause: cl, gate: gi }));
    else if (g.op === 'or') [[L(a, true), L(b), L(d)], [L(a), L(b, true)], [L(a), L(d, true)]].forEach((cl) => cnf2.push({ clause: cl, gate: gi }));
    else [[L(a), L(b)], [L(a, true), L(b, true)]].forEach((cl) => cnf2.push({ clause: cl, gate: gi }));
  });
  const out = c.n + gates.length - 1;
  cnf2.push({ clause: [L(out)], gate: -1 });
  // stage 4: pad to three literals
  const cnf3: { clause: Clause; gate: number }[] = [];
  let pad = 0;
  const fresh = () => { vars.push(`p${++pad}`); return vars.length - 1; };
  for (const { clause, gate } of cnf2) {
    if (clause.length === 3) cnf3.push({ clause, gate });
    else if (clause.length === 2) { const x = fresh(); cnf3.push({ clause: [...clause, L(x)], gate }, { clause: [...clause, L(x, true)], gate }); }
    else { const x = fresh(), y = fresh(); for (const [nx, ny] of [[false, false], [true, false], [false, true], [true, true]]) cnf3.push({ clause: [...clause, L(x, nx), L(y, ny)], gate }); }
  }
  return { bin, vars, cnf2, cnf3 };
}
export const litText = (vars: string[], l: Lit) => (l.neg ? '¬' : '') + vars[l.v];

// ---------- the running 3CNF example ----------
/** (a ∨ b ∨ c) ∧ (b ∨ ¬c ∨ ¬d) ∧ (¬a ∨ c ∨ d) ∧ (a ∨ ¬b ∨ ¬d) */
export const BOOK_3CNF: CNF = {
  vars: ['a', 'b', 'c', 'd'],
  clauses: [
    [{ v: 0, neg: false }, { v: 1, neg: false }, { v: 2, neg: false }],
    [{ v: 1, neg: false }, { v: 2, neg: true }, { v: 3, neg: true }],
    [{ v: 0, neg: true }, { v: 2, neg: false }, { v: 3, neg: false }],
    [{ v: 0, neg: false }, { v: 1, neg: true }, { v: 3, neg: true }],
  ],
};
export const satisfyingAssignments = (f: CNF) => {
  const out: boolean[][] = [];
  for (let m = 0; m < 1 << f.vars.length; m++) { const a = bitsOf(m, f.vars.length); if (f.clauses.every((c) => clauseTrue(c, a))) out.push(a); }
  return out;
};

/** 12.7: one vertex per literal occurrence; triangle per clause; edges between contradictory literals. */
export function indSetGraph(f: CNF): G & { lits: Lit[] } {
  const lits = f.clauses.flat(), k = f.clauses.length, edges: [number, number][] = [];
  for (let j = 0; j < k; j++) for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) edges.push([3 * j + p, 3 * j + q]);
  for (let p = 0; p < lits.length; p++) for (let q = p + 1; q < lits.length; q++)
    if (Math.floor(p / 3) !== Math.floor(q / 3) && lits[p].v === lits[q].v && lits[p].neg !== lits[q].neg) edges.push([p, q]);
  // a 2 × 2 arrangement of triangles
  const xy: [number, number][] = [];
  const centers: [number, number][] = [[1, 1], [4.4, 1], [1, 4], [4.4, 4]];
  for (let j = 0; j < k; j++) {
    const [cx, cy] = centers[j % 4];
    xy.push([cx, cy - 0.8], [cx - 0.85, cy + 0.6], [cx + 0.85, cy + 0.6]);
  }
  return { names: lits.map((l) => litText(f.vars, l)), xy, edges, lits };
}
export const isIndependent = (g: G, S: Set<number>) => g.edges.every(([u, v]) => !(S.has(u) && S.has(v)));
export function maxIndependentBrute(g: G): number {
  const n = g.names.length; let best = 0;
  for (let m = 0; m < 1 << n; m++) {
    const S = new Set([...Array(n)].map((_, i) => i).filter((i) => (m >> i) & 1));
    if (S.size > best && isIndependent(g, S)) best = S.size;
  }
  return best;
}
export const complement = (g: G): G => {
  const n = g.names.length, has = (u: number, v: number) => g.edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u)), edges: [number, number][] = [];
  for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (!has(u, v)) edges.push([u, v]);
  return { names: g.names, xy: g.xy, edges };
};

// ---------- 12.9: a small graph for clique / cover ----------
/** Seven vertices: largest independent set 3 ({a, d, f} …), so smallest vertex cover 4. */
export const SMALL_G: G = {
  names: 'abcdefg'.split(''),
  xy: [[1.5, 0], [0, 1], [3, 1], [0.6, 2.6], [2.4, 2.6], [1.5, 1.3], [3.6, 2.4]],
  edges: [[0, 1], [0, 2], [0, 5], [1, 3], [1, 5], [2, 5], [2, 4], [2, 6], [3, 4], [3, 5], [4, 5], [4, 6]],
};

// ---------- 12.10: 3-coloring gadgets ----------
export type Color = 0 | 1 | 2;   // 0 = True, 1 = False, 2 = Other
/** The clause gadget: literal nodes l0, l1, l2 (fixed T/F), node T, and five internal nodes. */
export const CLAUSE_GADGET: G = {
  names: ['a', 'b', 'c', 'T', '', '', '', '', ''],
  xy: [[0, 0], [0, 1.2], [0, 2.6], [5, 2.3], [1.3, 0.1], [1.3, 1.1], [2.3, 0.6], [3.4, 1.4], [3.4, 2.5]],
  edges: [[0, 4], [1, 5], [4, 5], [4, 6], [5, 6], [6, 7], [2, 8], [7, 8], [7, 3], [8, 3]],
};
/** Some valid coloring of the five internal nodes, or null. lits[i] ∈ {0 (True), 1 (False)}. */
export function extendGadget(lits: Color[]): Color[] | null {
  const fixed: (Color | null)[] = [lits[0], lits[1], lits[2], 0, null, null, null, null, null];
  for (let m = 0; m < 243; m++) {
    const col = [...fixed] as Color[];
    let x = m;
    for (let i = 4; i < 9; i++) { col[i] = (x % 3) as Color; x = Math.floor(x / 3); }
    if (CLAUSE_GADGET.edges.every(([u, v]) => col[u] !== col[v])) return col;
  }
  return null;
}

// ---------- 12.11: 3SAT → directed Hamiltonian cycle ----------
/**
 * The book's construction, corrected: each row has 3k + 1 vertices, clause j (0-based) uses the pair (3j + 1, 3j + 2),
 * and a separator vertex 3j + 3 sits between consecutive pairs. (With the book's 2k + 1 vertices and adjacent pairs,
 * a cycle can enter a clause vertex from one row and leave into another, and some unsatisfiable formulas get a cycle.)
 * Vertex ids: (i, j) ↦ i·W + j with W = 3k + 1; clause j ↦ n·W + j.
 */
export function hamFromSat(f: CNF, book = false) {
  const n = f.vars.length, k = f.clauses.length, W = book ? 2 * k + 1 : 3 * k + 1, id = (i: number, j: number) => i * W + j, cl = (j: number) => n * W + j;
  const slot = (j: number): [number, number] => (book ? [2 * j + 1, 2 * j + 2] : [3 * j + 1, 3 * j + 2]);
  const edges: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = 1; j < W; j++) edges.push([id(i, j - 1), id(i, j)], [id(i, j), id(i, j - 1)]);
  for (let i = 0; i < n; i++) { const i2 = (i + 1) % n; for (const a of [0, W - 1]) for (const b of [0, W - 1]) edges.push([id(i, a), id(i2, b)]); }
  f.clauses.forEach((c, j) => c.forEach(({ v, neg }) => {
    const [l, r] = slot(j), L = id(v, l), R = id(v, r);
    if (!neg) edges.push([L, cl(j)], [cl(j), R]); else edges.push([R, cl(j)], [cl(j), L]);
  }));
  return { V: n * W + k, edges, id, cl, W, slot };
}
/** The Hamiltonian cycle for a satisfying assignment (corrected construction); clause j is picked up by its first true literal. */
export function hamCycleFor(f: CNF, a: boolean[]): number[] | null {
  const { id, cl, W, slot } = hamFromSat(f), n = f.vars.length;
  const pick = f.clauses.map((c) => c.find((l) => litTrue(l, a)) ?? null);
  if (pick.some((p) => p === null)) return null;
  const seq: number[] = [];
  for (let i = 0; i < n; i++) {
    const cols = a[i] ? [...Array(W)].map((_, j) => j) : [...Array(W)].map((_, j) => W - 1 - j);
    for (const j of cols) {
      seq.push(id(i, j));
      pick.forEach((p, c) => { if (p!.v === i && ((a[i] && j === slot(c)[0]) || (!a[i] && j === slot(c)[1]))) seq.push(cl(c)); });
    }
  }
  return seq;
}

// ---------- 12.12: vertex cover → subset sum ----------
export const SS_G: G = { names: ['u', 'v', 'w', 'x'], xy: [[0, 0], [2, 0], [0, 1.6], [2, 1.6]], edges: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3]] };
/** Base-4 digits, most significant first: digit E is the vertex flag, then edges E−1 … 0 (edge i ↦ 4^i, numbering the book's way: uv = 4^4 … wx = 4^0). */
export function subsetSumFromVC(g: G, k: number) {
  const E = g.edges.length, ei = (e: number) => E - 1 - e;   // book order: first listed edge is the highest digit
  const a = g.names.map((_, v) => 4 ** E + g.edges.reduce((s, [p, q], e) => s + (p === v || q === v ? 4 ** ei(e) : 0), 0));
  const b = g.edges.map((_, e) => 4 ** ei(e));
  const T = k * 4 ** E + [...Array(E)].reduce((s, _, i) => s + 2 * 4 ** i, 0);
  return { a, b, T, E };
}
export const base4 = (x: number, digits: number) => [...Array(digits)].map((_, i) => Math.floor(x / 4 ** (digits - 1 - i)) % 4);

// Book chapter 4: tapes, class scheduling, Huffman codes, stable matching.

/* ---------------- 4.1 files on tape ---------------- */
/** Σ_k F[π(k)] · Σ_{i ≤ k} L[π(i)] for the order `order` (indices into L and F). */
export function tapeCost(order: number[], L: number[], F: number[]): number {
  let pos = 0, total = 0;
  for (const k of order) { pos += L[k]; total += F[k] * pos; }
  return total;
}

/* ---------------- 4.2 class scheduling ---------------- */
export interface Klass { id: number; s: number; f: number }
export function randomClasses(n: number, seed: number, M = 100): Klass[] {
  let x = seed >>> 0;
  const rnd = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  return Array.from({ length: n }, (_, id) => {
    const len = 4 + Math.floor(rnd() * 22), s = Math.floor(rnd() * (M - len));
    return { id, s, f: s + len };
  });
}
export interface SchedFrame { i: number; taken: number[]; rejected: number[]; last: number }
/** GreedySchedule on classes sorted by finish time; one frame per class considered. Strict S > F as in the book. */
export function scheduleFrames(cls: Klass[]): { order: Klass[]; frames: SchedFrame[] } {
  const order = [...cls].sort((a, b) => a.f - b.f || a.s - b.s);
  const frames: SchedFrame[] = [{ i: -1, taken: [], rejected: [], last: -Infinity }];
  const taken: number[] = [], rejected: number[] = [];
  let last = -Infinity;
  order.forEach((c, i) => {
    if (c.s > last) { taken.push(c.id); last = c.f; } else rejected.push(c.id);
    frames.push({ i, taken: [...taken], rejected: [...rejected], last });
  });
  return { order, frames };
}
/** Largest conflict-free subset by the O(n²) dynamic program (for checking the greedy answer). */
export function maxSchedule(cls: Klass[]): number {
  const o = [...cls].sort((a, b) => a.f - b.f), n = o.length, best = Array(n).fill(1);
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) if (o[j].f < o[i].s) best[i] = Math.max(best[i], best[j] + 1);
  return n ? Math.max(...best) : 0;
}

/* ---------------- 4.4 Huffman codes ---------------- */
export const SALLOWS: Record<string, number> = { A: 3, C: 3, D: 2, E: 26, F: 5, G: 3, H: 8, I: 13, L: 2, N: 16, O: 9, R: 6, S: 27, T: 22, U: 2, V: 5, W: 8, X: 4, Y: 5, Z: 1 };

export interface HNode { id: number; w: number; label: string; left: number; right: number }
export interface HFrame { forest: number[]; merged: [number, number] | null; made: number }
/** BuildHuffman with a deterministic tie-break (smaller weight, then older node). */
export function huffmanFrames(freq: Record<string, number>) {
  const nodes: HNode[] = Object.entries(freq).filter(([, w]) => w > 0).map(([label, w], id) => ({ id, w, label, left: -1, right: -1 }));
  let forest = nodes.map((v) => v.id);
  const frames: HFrame[] = [{ forest: [...forest], merged: null, made: -1 }];
  const pick = () => {
    let b = forest[0];
    for (const v of forest) if (nodes[v].w < nodes[b].w || (nodes[v].w === nodes[b].w && v < b)) b = v;
    forest = forest.filter((v) => v !== b);
    return b;
  };
  while (forest.length > 1) {
    const x = pick(), y = pick();
    const id = nodes.length;
    nodes.push({ id, w: nodes[x].w + nodes[y].w, label: nodes[x].label + nodes[y].label, left: x, right: y });
    forest.push(id);
    frames.push({ forest: [...forest], merged: [x, y], made: id });
  }
  const root = forest[0];
  const codes: Record<string, string> = {};
  const walk = (v: number, c: string) => {
    if (v < 0) return;
    const nd = nodes[v];
    if (nd.left < 0) { codes[nd.label] = c || '0'; return; }
    walk(nd.left, c + '0'); walk(nd.right, c + '1');
  };
  if (root !== undefined) walk(root, '');
  const bits = Object.entries(freq).reduce((s, [ch, w]) => s + (codes[ch] ? w * codes[ch].length : 0), 0);
  return { nodes, frames, root, codes, bits };
}
export function countLetters(text: string): Record<string, number> {
  const f: Record<string, number> = {};
  for (const ch of text) if (ch.trim()) f[ch] = (f[ch] ?? 0) + 1;
  return f;
}

/* ---------------- 4.5 stable matching ---------------- */
export interface Prefs { H: string[]; D: string[]; hpref: string[][]; dpref: string[][] }
/** The book's 4×4 example (hospitals A–D, doctors q–t). */
export const BOOK4: Prefs = {
  H: ['A', 'B', 'C', 'D'], D: ['q', 'r', 's', 't'],
  hpref: [['t', 's', 'r', 'q'], ['r', 't', 'q', 's'], ['t', 'r', 's', 'q'], ['s', 'r', 'q', 't']],
  dpref: [['A', 'B', 'C', 'D'], ['A', 'D', 'C', 'B'], ['B', 'A', 'C', 'D'], ['D', 'B', 'C', 'A']],
};
/** The book's 3×3 example from "Some Bad Ideas". */
export const BOOK3: Prefs = {
  H: ['A', 'B', 'C'], D: ['q', 'r', 's'],
  hpref: [['r', 'q', 's'], ['s', 'q', 'r'], ['q', 'r', 's']],
  dpref: [['A', 'C', 'B'], ['C', 'A', 'B'], ['A', 'B', 'C']],
};
export interface GSFrame { proposer: string; target: string; result: 'accept' | 'switch' | 'reject' | 'start' | 'done'; dumped: string | null; match: Record<string, string> }
/**
 * Gale–Shapley with the proposing side chosen by `side`. `order` decides which free proposer moves next:
 * 'book' replays the order printed in the book (hospitals propose, 4×4 example), otherwise the first free proposer.
 */
export function galeShapley(p: Prefs, side: 'H' | 'D', bookOrder = false) {
  const P = side === 'H' ? p.H : p.D, R = side === 'H' ? p.D : p.H;
  const ppref = side === 'H' ? p.hpref : p.dpref, rpref = side === 'H' ? p.dpref : p.hpref;
  const next: Record<string, number> = Object.fromEntries(P.map((x) => [x, 0]));
  const holder: Record<string, string> = {};            // receiver → proposer
  const rank = (r: string, x: string) => rpref[R.indexOf(r)].indexOf(x);
  const frames: GSFrame[] = [{ proposer: '', target: '', result: 'start', dumped: null, match: {} }];
  const script = bookOrder ? ['A', 'B', 'C', 'D', 'A', 'D', 'B', 'C', 'C', 'C'] : null;
  let step = 0;
  for (;;) {
    const free = P.filter((x) => !Object.values(holder).includes(x) && next[x] < R.length);
    if (!free.length) break;
    const x = script && step < script.length && free.includes(script[step]) ? script[step] : free[0];
    step++;
    const r = ppref[P.indexOf(x)][next[x]++];
    const cur = holder[r];
    let result: GSFrame['result'], dumped: string | null = null;
    if (cur === undefined) { holder[r] = x; result = 'accept'; }
    else if (rank(r, x) < rank(r, cur)) { holder[r] = x; dumped = cur; result = 'switch'; }
    else result = 'reject';
    frames.push({ proposer: x, target: r, result, dumped, match: { ...holder } });
  }
  frames.push({ proposer: '', target: '', result: 'done', dumped: null, match: { ...holder } });
  // matching as hospital → doctor
  const m: Record<string, string> = {};
  for (const [r, x] of Object.entries(holder)) side === 'H' ? (m[x] = r) : (m[r] = x);
  return { frames, matching: m, offers: frames.length - 2 };
}
/** All unstable pairs (doctor, hospital) for a matching hospital → doctor. */
export function unstablePairs(p: Prefs, m: Record<string, string>): [string, string][] {
  const docOf = m, hospOf: Record<string, string> = Object.fromEntries(Object.entries(m).map(([h, d]) => [d, h]));
  const out: [string, string][] = [];
  for (const d of p.D) for (const h of p.H) {
    if (docOf[h] === d) continue;
    const dp = p.dpref[p.D.indexOf(d)], hp = p.hpref[p.H.indexOf(h)];
    const dWants = hospOf[d] === undefined || dp.indexOf(h) < dp.indexOf(hospOf[d]);
    const hWants = docOf[h] === undefined || hp.indexOf(d) < hp.indexOf(docOf[h]);
    if (dWants && hWants) out.push([d, h]);
  }
  return out;
}
export function randomPrefs(n: number, seed: number): Prefs {
  let x = seed >>> 0;
  const rnd = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const H = 'ABCDEFGH'.slice(0, n).split(''), D = 'qrstuvwx'.slice(0, n).split('');
  const shuf = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  return { H, D, hpref: H.map(() => shuf(D)), dpref: D.map(() => shuf(H)) };
}

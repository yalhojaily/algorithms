// A tiny propositional-logic toolkit: parse a formula, list its subformulas, build its truth table.
//
// Accepted syntax (any mix):
//   NOT  : ¬  !  ~  not
//   AND  : ∧  &  &&  and
//   XOR  : ⊕  ^  xor
//   OR   : ∨  |  ||  or
//   IMPLIES : →  ->  =>  implies
//   IFF  : ↔  <->  <=>  iff
//   constants: 1 / 0 (or ⊤ / ⊥)
//   variables: a single letter, optionally followed by digits (P, Q, r, x1)
// Precedence, tightest first: NOT, AND, XOR, OR, IMPLIES, IFF. IMPLIES groups to the right.

export type Op = 'and' | 'or' | 'xor' | 'implies' | 'iff';

export type Formula =
  | { kind: 'var'; name: string }
  | { kind: 'const'; value: boolean }
  | { kind: 'not'; arg: Formula }
  | { kind: 'bin'; op: Op; left: Formula; right: Formula };

export class ParseError extends Error {
  constructor(message: string, public pos: number) {
    super(message);
  }
}

type Tok = { t: 'var'; v: string; pos: number } | { t: 'const'; v: boolean; pos: number } | { t: 'op'; v: Op | 'not' | '(' | ')'; pos: number };

const WORDS: Record<string, Op | 'not'> = { not: 'not', and: 'and', or: 'or', xor: 'xor', implies: 'implies', iff: 'iff' };
const SYMBOLS: [string, Op | 'not' | '(' | ')'][] = [
  ['<->', 'iff'], ['<=>', 'iff'], ['->', 'implies'], ['=>', 'implies'], ['&&', 'and'], ['||', 'or'],
  ['↔', 'iff'], ['→', 'implies'], ['∧', 'and'], ['∨', 'or'], ['⊕', 'xor'], ['¬', 'not'],
  ['!', 'not'], ['~', 'not'], ['&', 'and'], ['|', 'or'], ['^', 'xor'], ['(', '('], [')', ')'],
];

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const sym = SYMBOLS.find(([s]) => src.startsWith(s, i));
    if (sym) { out.push({ t: 'op', v: sym[1], pos: i }); i += sym[0].length; continue; }
    if (c === '1' || c === '⊤') { out.push({ t: 'const', v: true, pos: i }); i++; continue; }
    if (c === '0' || c === '⊥') { out.push({ t: 'const', v: false, pos: i }); i++; continue; }
    const m = /^[A-Za-z][A-Za-z0-9]*/.exec(src.slice(i));
    if (m) {
      const word = m[0].toLowerCase();
      if (WORDS[word]) out.push({ t: 'op', v: WORDS[word], pos: i });
      else if (/^[A-Za-z][0-9]*$/.test(m[0])) out.push({ t: 'var', v: m[0], pos: i });
      else throw new ParseError(`اسم غير مفهوم «${m[0]}»: اسم المتغير حرف واحد، مثل P أو Q`, i);
      i += m[0].length;
      continue;
    }
    throw new ParseError(`رمز غير مفهوم «${c}»`, i);
  }
  return out;
}

const LEVELS: Op[][] = [['iff'], ['implies'], ['or'], ['xor'], ['and']];

export function parse(src: string): Formula {
  const toks = tokenize(src);
  let k = 0;
  const peek = () => toks[k];
  const endPos = src.length;

  function level(n: number): Formula {
    if (n === LEVELS.length) return unary();
    const ops = LEVELS[n];
    const left = level(n + 1);
    const tok = peek();
    if (tok && tok.t === 'op' && ops.includes(tok.v as Op)) {
      const op = tok.v as Op;
      if (op === 'implies') {
        k++;
        return { kind: 'bin', op, left, right: level(n) }; // right-associative
      }
      let acc = left;
      while (peek() && peek().t === 'op' && ops.includes(peek().v as Op)) {
        const o = peek().v as Op;
        k++;
        acc = { kind: 'bin', op: o, left: acc, right: level(n + 1) };
      }
      return acc;
    }
    return left;
  }

  function unary(): Formula {
    const tok = peek();
    if (!tok) throw new ParseError('الصيغة ناقصة: يُنتظر متغير أو قوس', endPos);
    if (tok.t === 'op' && tok.v === 'not') { k++; return { kind: 'not', arg: unary() }; }
    if (tok.t === 'op' && tok.v === '(') {
      k++;
      const inner = level(0);
      const close = peek();
      if (!close || close.t !== 'op' || close.v !== ')') throw new ParseError('قوس مفتوح لم يُغلق', close?.pos ?? endPos);
      k++;
      return inner;
    }
    if (tok.t === 'var') { k++; return { kind: 'var', name: tok.v }; }
    if (tok.t === 'const') { k++; return { kind: 'const', value: tok.v }; }
    throw new ParseError('يُنتظر متغير أو قوس هنا', tok.pos);
  }

  if (toks.length === 0) throw new ParseError('اكتب صيغة', 0);
  const f = level(0);
  if (k < toks.length) throw new ParseError('رمز زائد لم يُتوقع هنا', toks[k].pos);
  return f;
}

export function evaluate(f: Formula, env: Record<string, boolean>): boolean {
  switch (f.kind) {
    case 'var': return env[f.name] ?? false;
    case 'const': return f.value;
    case 'not': return !evaluate(f.arg, env);
    case 'bin': {
      const a = evaluate(f.left, env);
      const b = evaluate(f.right, env);
      switch (f.op) {
        case 'and': return a && b;
        case 'or': return a || b;
        case 'xor': return a !== b;
        case 'implies': return !a || b;
        case 'iff': return a === b;
      }
    }
  }
}

/** Variables in a stable order: alphabetical, with P, Q, R… kept in the order people expect. */
export function variables(f: Formula): string[] {
  const s = new Set<string>();
  const walk = (g: Formula) => {
    if (g.kind === 'var') s.add(g.name);
    else if (g.kind === 'not') walk(g.arg);
    else if (g.kind === 'bin') { walk(g.left); walk(g.right); }
  };
  walk(f);
  return [...s].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

const SYM: Record<Op, string> = { and: '∧', or: '∨', xor: '⊕', implies: '→', iff: '↔' };
const PREC: Record<Op, number> = { iff: 1, implies: 2, or: 3, xor: 4, and: 5 };
export const TEX: Record<Op, string> = { and: '\\land', or: '\\lor', xor: '\\oplus', implies: '\\rightarrow', iff: '\\leftrightarrow' };

function prec(f: Formula): number {
  return f.kind === 'bin' ? PREC[f.op] : 9;
}

/** Pretty-print with only the parentheses that are needed. */
export function show(f: Formula, tex = false): string {
  const wrap = (s: string) => (tex ? `(${s})` : `(${s})`);
  switch (f.kind) {
    case 'var': return f.name;
    case 'const': return tex ? (f.value ? '\\top' : '\\bot') : f.value ? '1' : '0';
    case 'not': {
      const inner = show(f.arg, tex);
      return (tex ? '\\lnot ' : '¬') + (f.arg.kind === 'bin' ? wrap(inner) : inner);
    }
    case 'bin': {
      const p = PREC[f.op];
      const rightAssoc = f.op === 'implies';
      const l = show(f.left, tex);
      const r = show(f.right, tex);
      const lp = prec(f.left) < p || (rightAssoc && prec(f.left) === p) ? wrap(l) : l;
      const rp = prec(f.right) < p || (!rightAssoc && prec(f.right) === p && f.op !== 'and' && f.op !== 'or') ? wrap(r) : r;
      return `${lp} ${tex ? TEX[f.op] : SYM[f.op]} ${rp}`;
    }
  }
}

/** Every distinct compound subformula, innermost first — the columns of a full truth table. */
export function subformulas(f: Formula): Formula[] {
  const out: Formula[] = [];
  const seen = new Set<string>();
  const walk = (g: Formula) => {
    if (g.kind === 'not') walk(g.arg);
    if (g.kind === 'bin') { walk(g.left); walk(g.right); }
    if (g.kind === 'var' || g.kind === 'const') return;
    const key = show(g);
    if (!seen.has(key)) { seen.add(key); out.push(g); }
  };
  walk(f);
  return out;
}

/** All 2^n assignments, in textbook order: the first variable changes slowest, starting from all-true. */
export function assignments(vars: string[]): Record<string, boolean>[] {
  const n = vars.length;
  const rows: Record<string, boolean>[] = [];
  for (let i = 0; i < 2 ** n; i++) {
    const env: Record<string, boolean> = {};
    vars.forEach((v, j) => { env[v] = ((i >> (n - 1 - j)) & 1) === 0; });
    rows.push(env);
  }
  return rows;
}

export type Kind = 'tautology' | 'contradiction' | 'contingent';

export function classify(f: Formula): Kind {
  const vals = assignments(variables(f)).map((e) => evaluate(f, e));
  if (vals.every(Boolean)) return 'tautology';
  if (!vals.some(Boolean)) return 'contradiction';
  return 'contingent';
}

/** First assignment on which f and g disagree, or null if they are equivalent. */
export function counterexample(f: Formula, g: Formula): Record<string, boolean> | null {
  const vars = [...new Set([...variables(f), ...variables(g)])].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  for (const env of assignments(vars)) if (evaluate(f, env) !== evaluate(g, env)) return env;
  return null;
}

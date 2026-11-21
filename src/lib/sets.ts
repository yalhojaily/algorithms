// Set expressions over A, B, C (and the universe U): parse, evaluate on a Venn region, print.
//
// Syntax:  ∪ or | or +   union          ∩ or &   intersection
//          − or - or \    difference     Δ or ^   symmetric difference
//          ᶜ or '  (postfix) complement  ~ or ¬  (prefix) complement
//          ∅ or 0   empty set            U        universe        ( )
// Precedence: complement, then ∩, then ∪ − Δ (left to right).

export type SetExpr =
  | { k: 'var'; name: 'A' | 'B' | 'C' }
  | { k: 'U' }
  | { k: 'empty' }
  | { k: 'comp'; a: SetExpr }
  | { k: 'bin'; op: 'union' | 'inter' | 'diff' | 'sym'; a: SetExpr; b: SetExpr };

export class SetParseError extends Error {}

type Tok = string;

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  for (const ch of src.replace(/\s+/g, '')) {
    if ('ABCabc'.includes(ch)) out.push(ch.toUpperCase());
    else if (ch === 'U' || ch === 'u') out.push('U');
    else if ('∪|+'.includes(ch)) out.push('∪');
    else if ('∩&'.includes(ch)) out.push('∩');
    else if ('−-\\'.includes(ch)) out.push('−');
    else if ('Δ∆^'.includes(ch)) out.push('Δ');
    else if ("ᶜ'′".includes(ch)) out.push('ᶜ');
    else if ('~¬'.includes(ch)) out.push('~');
    else if ('∅0'.includes(ch)) out.push('∅');
    else if ('()'.includes(ch)) out.push(ch);
    else throw new SetParseError(`رمز غير مفهوم «${ch}»`);
  }
  return out;
}

export function parseSet(src: string): SetExpr {
  const t = tokenize(src);
  let i = 0;
  const peek = () => t[i];
  function low(): SetExpr {
    let a = mid();
    while (peek() === '∪' || peek() === '−' || peek() === 'Δ') {
      const o = t[i++];
      const b = mid();
      a = { k: 'bin', op: o === '∪' ? 'union' : o === '−' ? 'diff' : 'sym', a, b };
    }
    return a;
  }
  function mid(): SetExpr {
    let a = unary();
    while (peek() === '∩') {
      i++;
      a = { k: 'bin', op: 'inter', a, b: unary() };
    }
    return a;
  }
  function unary(): SetExpr {
    if (peek() === '~') { i++; return { k: 'comp', a: unary() }; }
    let a = atom();
    while (peek() === 'ᶜ') { i++; a = { k: 'comp', a }; }
    return a;
  }
  function atom(): SetExpr {
    const x = t[i++];
    if (x === undefined) throw new SetParseError('التعبير ناقص');
    if (x === 'A' || x === 'B' || x === 'C') return { k: 'var', name: x };
    if (x === 'U') return { k: 'U' };
    if (x === '∅') return { k: 'empty' };
    if (x === '(') {
      const e = low();
      if (t[i++] !== ')') throw new SetParseError('قوس مفتوح لم يُغلق');
      return e;
    }
    throw new SetParseError(`لم يُتوقع «${x}» هنا`);
  }
  if (t.length === 0) throw new SetParseError('اكتب تعبيرًا');
  const e = low();
  if (i < t.length) throw new SetParseError(`رمز زائد «${t[i]}»`);
  return e;
}

/** Membership of an element that is in A? B? C? (a Venn region). */
export function member(e: SetExpr, a: boolean, b: boolean, c: boolean): boolean {
  switch (e.k) {
    case 'var': return e.name === 'A' ? a : e.name === 'B' ? b : c;
    case 'U': return true;
    case 'empty': return false;
    case 'comp': return !member(e.a, a, b, c);
    case 'bin': {
      const x = member(e.a, a, b, c);
      const y = member(e.b, a, b, c);
      return e.op === 'union' ? x || y : e.op === 'inter' ? x && y : e.op === 'diff' ? x && !y : x !== y;
    }
  }
}

const PREC = { union: 1, diff: 1, sym: 1, inter: 2 } as const;
const SYM = { union: '∪', inter: '∩', diff: '−', sym: 'Δ' } as const;
const TEXOP = { union: '\\cup', inter: '\\cap', diff: '\\setminus', sym: '\\,\\triangle\\,' } as const;

export function showSet(e: SetExpr, tex = false): string {
  const wrap = (s: string) => `(${s})`;
  switch (e.k) {
    case 'var': return e.name;
    case 'U': return 'U';
    case 'empty': return tex ? '\\varnothing' : '∅';
    case 'comp': {
      const s = showSet(e.a, tex);
      const inner = e.a.k === 'bin' ? wrap(s) : s;
      return tex ? (e.a.k === 'var' ? `\\overline{${s}}` : `${inner}^{c}`) : `${inner}ᶜ`;
    }
    case 'bin': {
      const p = PREC[e.op];
      const l = showSet(e.a, tex);
      const r = showSet(e.b, tex);
      const lp = e.a.k === 'bin' && PREC[e.a.op] < p ? wrap(l) : l;
      const rp = e.b.k === 'bin' && (PREC[e.b.op] < p || (PREC[e.b.op] === p && e.op !== e.b.op) || (e.op === 'diff' && PREC[e.b.op] === p)) ? wrap(r) : r;
      return `${lp} ${tex ? TEXOP[e.op] : SYM[e.op]} ${rp}`;
    }
  }
}

/** The 8 Venn regions in a fixed order: (in A, in B, in C). */
export const REGIONS: [boolean, boolean, boolean][] = [
  [true, true, true], [true, true, false], [true, false, true], [true, false, false],
  [false, true, true], [false, true, false], [false, false, true], [false, false, false],
];

export const usesC = (e: SetExpr): boolean =>
  e.k === 'var' ? e.name === 'C' : e.k === 'comp' ? usesC(e.a) : e.k === 'bin' ? usesC(e.a) || usesC(e.b) : false;

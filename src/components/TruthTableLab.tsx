import { useMemo, useRef, useState } from 'react';
import { assignments, evaluate, parse, ParseError, show, subformulas, variables, type Formula, type Kind } from '../lib/logic';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';
import { Tex } from './MathText';

const PSEUDO = [
  'TRUTH-TABLE(φ):',
  '  V ← the variables of φ   // n = |V|',
  '  for each assignment a to V:  // 2ⁿ rows',
  '    for each subformula ψ, innermost first:',
  '      a[ψ] ← ψ\'s connective on its parts',
  '    record a[φ]',
  '  if every record is T: return VALID',
  '  if some record is T:  return SATISFIABLE',
  '  return UNSATISFIABLE',
];

const PRESETS = [
  'P -> Q',
  '!(P & Q) <-> !P | !Q',
  '(P -> Q) <-> (!Q -> !P)',
  '(P -> Q) <-> (Q -> P)',
  '(P -> Q) & (Q -> R) -> (P -> R)',
  'P & !P',
];

const KEYS: [string, string][] = [['¬', 'NOT'], ['∧', 'AND'], ['∨', 'OR'], ['⊕', 'XOR'], ['→', 'IMPLIES'], ['↔', 'IFF'], ['(', ''], [')', '']];

const VERDICT: Record<Kind, { label: string; en: string; cls: string; text: string }> = {
  tautology: { label: 'صالحة (تحصيل حاصل)', en: 'VALID', cls: 'T', text: 'صادقة في كل الصفوف، أيًّا كانت قيم المتغيرات.' },
  contingent: { label: 'قابلة للتحقق', en: 'SATISFIABLE', cls: 'S', text: 'صادقة في بعض الصفوف وكاذبة في بعضها.' },
  contradiction: { label: 'غير قابلة للتحقق (تناقض)', en: 'UNSATISFIABLE', cls: 'F', text: 'كاذبة في كل الصفوف.' },
};

interface Frame {
  line: number;
  row: number; // -1 before the first row
  col: number; // index into the compound columns, -1 = none yet
  ops: number; // connective evaluations so far
  verdict?: Kind;
  note: string;
}

interface Built {
  f: Formula;
  vars: string[];
  subs: Formula[];
  rows: Record<string, boolean>[];
  values: boolean[][]; // values[row][subIndex]
  kids: number[][]; // for each compound column, the column indices (vars first) of its parts
  kind: Kind;
}

const tv = (b: boolean) => (b ? 'T' : 'F');

function build(src: string): Built | { error: string; pos: number } {
  let f: Formula;
  try {
    f = parse(src);
  } catch (e) {
    if (e instanceof ParseError) return { error: e.message, pos: e.pos };
    throw e;
  }
  const vars = variables(f);
  if (vars.length > 5) return { error: 'استخدم 5 متغيرات على الأكثر هنا (32 صفًا)', pos: 0 };
  let subs = subformulas(f);
  if (subs.length === 0) subs = [f]; // a lone variable: show it as its own column
  const key = subs.map((s) => show(s));
  const colOf = (g: Formula) => (g.kind === 'var' ? vars.indexOf(g.name) : vars.length + key.indexOf(show(g)));
  const kids = subs.map((s) => (s.kind === 'not' ? [colOf(s.arg)] : s.kind === 'bin' ? [colOf(s.left), colOf(s.right)] : []));
  const rows = assignments(vars);
  const values = rows.map((env) => subs.map((s) => evaluate(s, env)));
  const last = values.map((r) => r[r.length - 1]);
  const kind: Kind = last.every(Boolean) ? 'tautology' : last.some(Boolean) ? 'contingent' : 'contradiction';
  return { f, vars, subs, rows, values, kids, kind };
}

function* run(b: Built): Generator<Frame> {
  const n = b.vars.length;
  const m = b.subs.length;
  yield { line: 2, row: -1, col: -1, ops: 0, note: `المتغيرات: ${b.vars.join('، ') || 'لا يوجد'} — أي n = ${n}، فعدد الصفوف 2^${n} = ${2 ** n}.` };
  let ops = 0;
  for (let r = 0; r < b.rows.length; r++) {
    const env = b.rows[r];
    yield { line: 3, row: r, col: -1, ops, note: `الصف ${r + 1}: ${b.vars.map((v) => `${v} = ${tv(env[v])}`).join('، ')}` };
    for (let c = 0; c < m; c++) {
      ops++;
      yield { line: 5, row: r, col: c, ops, note: `${show(b.subs[c])} = ${tv(b.values[r][c])}` };
    }
    yield { line: 6, row: r, col: m - 1, ops, note: `سجّلنا قيمة φ في الصف ${r + 1}: ${tv(b.values[r][m - 1])}` };
  }
  const line = b.kind === 'tautology' ? 7 : b.kind === 'contingent' ? 8 : 9;
  yield { line, row: b.rows.length, col: -1, ops, verdict: b.kind, note: `انتهى: ${ops} عملية على ${b.rows.length} صفوف.` };
}

/** Type a formula; watch the brute-force truth-table algorithm fill the table one cell at a time. */
export default function TruthTableLab({ initial = '!(P & Q) <-> !P | !Q' }: { initial?: string }) {
  const [src, setSrc] = useState(initial);
  const input = useRef<HTMLInputElement>(null);
  const built = useMemo(() => build(src), [src]);
  const ok = !('error' in built);
  const frames = useMemo(() => (ok ? record(run(built as Built)) : [{ line: 1, row: -1, col: -1, ops: 0, note: '' } as Frame]), [built, ok]);
  const s = useStepper(frames, 4);

  const insert = (sym: string) => {
    const el = input.current;
    if (!el) return setSrc(src + sym);
    const a = el.selectionStart ?? src.length;
    const z = el.selectionEnd ?? src.length;
    const next = src.slice(0, a) + sym + src.slice(z);
    setSrc(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + sym.length, a + sym.length); });
  };

  const b = ok ? (built as Built) : null;
  const fr = s.frame;
  const nv = b?.vars.length ?? 0;
  const cellShown = (r: number, c: number) => fr.row > r || (fr.row === r && c <= fr.col);
  const isOperand = (r: number, colIdx: number) => b && fr.row === r && fr.col >= 0 && fr.line === 5 && b.kids[fr.col].includes(colIdx);

  return (
    <div className="widget card tt-lab">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">خوارزمية جدول الصدق، خطوة بخطوة</span>
      </div>

      <label className="tt-label" htmlFor="tt-input">اكتب صيغة (أو اختر مثالًا):</label>
      <input
        id="tt-input"
        ref={input}
        className={`tt-input ${ok ? '' : 'bad'}`}
        dir="ltr"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      <div className="tt-keys" dir="ltr">
        {KEYS.map(([k, name]) => (
          <button key={k} className="tt-key" onClick={() => insert(k)} title={name}>{k}</button>
        ))}
        <span className="tt-keys-help">أو اكتب: <code>! &amp; | ^ -&gt; &lt;-&gt;</code></span>
      </div>
      <div className="tt-presets">
        {PRESETS.map((p) => (
          <button key={p} className={`tt-preset ${p === src ? 'on' : ''}`} onClick={() => setSrc(p)} dir="ltr">{show(parse(p))}</button>
        ))}
      </div>

      {!b ? (
        <div className="tt-error">⚠️ {(built as { error: string }).error}</div>
      ) : (
        <>
          <div className="tt-formula"><Tex display>{`\\varphi \\;=\\; ${show(b.f, true)}`}</Tex></div>
          <div className="tt-grid">
            <div className="tt-table-wrap table-scroll" dir="ltr">
              <table className="nice tt tt-live">
                <thead>
                  <tr>
                    <th className="tt-rn">#</th>
                    {b.vars.map((v) => <th key={v} className="tt-var"><Tex>{v}</Tex></th>)}
                    {b.subs.map((sf, c) => (
                      <th key={c} className={`${fr.col === c && fr.line === 5 ? 'now' : ''} ${c === b.subs.length - 1 ? 'tt-main' : ''}`}>
                        <Tex>{show(sf, true)}</Tex>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((env, r) => (
                    <tr key={r} className={fr.row === r ? 'cur' : ''}>
                      <td className="tt-rn">{r + 1}</td>
                      {b.vars.map((v, j) => {
                        const shownVar = fr.row >= r;
                        return <td key={v} className={`${isOperand(r, j) ? 'operand' : ''}`}>{shownVar ? <span className={env[v] ? 'T' : 'F'}>{tv(env[v])}</span> : ''}</td>;
                      })}
                      {b.subs.map((_, c) => {
                        const now = fr.row === r && fr.col === c && fr.line === 5;
                        const v = b.values[r][c];
                        return (
                          <td key={c} className={`${now ? 'now' : ''} ${isOperand(r, nv + c) ? 'operand' : ''} ${c === b.subs.length - 1 ? 'tt-main' : ''}`}>
                            {cellShown(r, c) ? <span className={v ? 'T' : 'F'}>{tv(v)}</span> : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tt-side">
              <Pseudocode lines={PSEUDO} active={fr.line} />
              <div className="tt-info">
              <div className="tt-note" aria-live="polite"><span dir="auto">{fr.note}</span></div>
              <div className="tt-counters">
                <span>صفوف منتهية: <b className="ltr">{Math.max(0, Math.min(fr.row + (fr.line === 6 ? 1 : 0), b.rows.length))} / {b.rows.length}</b></span>
                <span>عمليات: <b className="ltr">{fr.ops}</b></span>
              </div>
              {fr.verdict && (
                <div className={`tt-verdict v-${VERDICT[fr.verdict].cls}`}>
                  <strong>{VERDICT[fr.verdict].label}</strong> <span className="en">{VERDICT[fr.verdict].en}</span>
                  <div>{VERDICT[fr.verdict].text}</div>
                </div>
              )}
              </div>
            </div>
          </div>
          <Player s={s} />
        </>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { assignments, counterexample, evaluate, parse, ParseError, show, variables, type Formula } from '../lib/logic';
import { Tex } from './MathText';

const PAIRS: [string, string, string][] = [
  ['!(P & Q)', '!P | !Q', 'De Morgan'],
  ['P -> Q', '!P | Q', 'الاستلزام كفصل'],
  ['P -> Q', '!Q -> !P', 'العكس النقيض'],
  ['P -> Q', 'Q -> P', 'العكس'],
  ['P & (Q | R)', 'P & Q | P & R', 'التوزيع'],
  ['P | Q & R', '(P | Q) & R', 'فخ الأقواس'],
];

function safe(src: string): Formula | string {
  try {
    return parse(src);
  } catch (e) {
    if (e instanceof ParseError) return e.message;
    throw e;
  }
}

/** Are two formulas equivalent? Check every row, and show the first row where they disagree. */
export default function EquivChecker() {
  const [a, setA] = useState('!(P & Q)');
  const [b, setB] = useState('!P | !Q');
  const fa = useMemo(() => safe(a), [a]);
  const fb = useMemo(() => safe(b), [b]);
  const both = typeof fa !== 'string' && typeof fb !== 'string';

  const result = useMemo(() => {
    if (!both) return null;
    const vars = [...new Set([...variables(fa as Formula), ...variables(fb as Formula)])].sort();
    if (vars.length > 6) return { tooMany: true as const };
    const rows = assignments(vars).map((env) => ({ env, x: evaluate(fa as Formula, env), y: evaluate(fb as Formula, env) }));
    return { vars, rows, cx: counterexample(fa as Formula, fb as Formula) };
  }, [fa, fb, both]);

  return (
    <div className="widget card eq">
      <div className="widget-head">
        <span className="widget-kicker">أداة</span>
        <span className="widget-title">فاحص التكافؤ</span>
      </div>
      <div className="eq-inputs" dir="ltr">
        <input className={`tt-input ${typeof fa === 'string' ? 'bad' : ''}`} value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} aria-label="الصيغة الأولى" />
        <span className="eq-sign">≡ ?</span>
        <input className={`tt-input ${typeof fb === 'string' ? 'bad' : ''}`} value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} aria-label="الصيغة الثانية" />
      </div>
      <div className="tt-presets">
        {PAIRS.map(([x, y, name]) => (
          <button key={name} className={`tt-preset ${x === a && y === b ? 'on' : ''}`} onClick={() => { setA(x); setB(y); }}>{name}</button>
        ))}
      </div>
      {!both ? (
        <div className="tt-error">⚠️ {typeof fa === 'string' ? fa : (fb as string)}</div>
      ) : result && 'tooMany' in result ? (
        <div className="tt-error">استخدم 6 متغيرات على الأكثر.</div>
      ) : result ? (
        <>
          <div className="table-scroll" dir="ltr">
            <table className="nice tt">
              <thead>
                <tr>
                  {result.vars.map((v) => <th key={v}><Tex>{v}</Tex></th>)}
                  <th><Tex>{show(fa as Formula, true)}</Tex></th>
                  <th><Tex>{show(fb as Formula, true)}</Tex></th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map(({ env, x, y }, r) => (
                  <tr key={r} className={x !== y ? 'differ' : ''}>
                    {result.vars.map((v) => <td key={v}><span className={env[v] ? 'T' : 'F'}>{env[v] ? 'T' : 'F'}</span></td>)}
                    <td><span className={x ? 'T' : 'F'}>{x ? 'T' : 'F'}</span></td>
                    <td><span className={y ? 'T' : 'F'}>{y ? 'T' : 'F'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.cx ? (
            <div className="tt-verdict v-F">
              <strong>غير متكافئتين.</strong> مثال مضاد: <span className="ltr">{Object.entries(result.cx).map(([k, v]) => `${k} = ${v ? 'T' : 'F'}`).join(', ')}</span> — الصف المظلل تختلف فيه القيمتان.
            </div>
          ) : (
            <div className="tt-verdict v-T"><strong>متكافئتان.</strong> لهما القيمة نفسها في كل الصفوف الـ {result.rows.length}.</div>
          )}
        </>
      ) : null}
    </div>
  );
}

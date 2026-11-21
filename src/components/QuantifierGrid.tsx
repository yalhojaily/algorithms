import { useMemo, useState } from 'react';
import { evaluate, PATTERNS, pseudocode, type Frame } from '../lib/quant';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';
import { Tex } from './MathText';

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);

const PREDICATES: { key: string; tex: string; label: string; D: number[]; f: (x: number, y: number) => boolean }[] = [
  { key: 'lt', tex: 'x < y', label: 'x < y', D: range(0, 5), f: (x, y) => x < y },
  { key: 'le', tex: 'x \\le y', label: 'x ≤ y', D: range(0, 5), f: (x, y) => x <= y },
  { key: 'inv', tex: 'x + y = 0', label: 'x + y = 0', D: range(-3, 3), f: (x, y) => x + y === 0 },
  { key: 'sq', tex: 'y = x^2', label: 'y = x²', D: range(-2, 4), f: (x, y) => y === x * x },
  { key: 'div', tex: 'x \\mid y', label: 'x | y', D: range(1, 6), f: (x, y) => y % x === 0 },
  { key: 'mul', tex: 'xy = 0', label: 'xy = 0', D: range(-2, 3), f: (x, y) => x * y === 0 },
];

const fmt = (v: number) => (v < 0 ? `−${-v}` : String(v));

/** Two nested quantifiers are two nested loops. Pick the order and the predicate, then watch the loops run. */
export default function QuantifierGrid() {
  const [pk, setPk] = useState('AE');
  const [rk, setRk] = useState('inv');
  const pat = PATTERNS.find((p) => p.key === pk)!;
  const pr = PREDICATES.find((p) => p.key === rk)!;
  const D = pr.D;
  const n = D.length;
  const frames = useMemo(() => record(evaluate(pat, n, (xi, yi) => pr.f(D[xi], D[yi]))), [pat, pr, n, D]);
  const s = useStepper<Frame>(frames, 3);
  const fr = s.frame;
  const lines = useMemo(() => pseudocode(pat), [pat]);

  const outerIsX = pat.outer.v === 'x';
  const checkedSet = new Set(fr.checked.map(([a, b]) => `${a},${b}`));
  const cur = fr.line === 5 && fr.o >= 0 && fr.i >= 0 ? (outerIsX ? [fr.o, fr.i] : [fr.i, fr.o]) : null;
  const inOuter = (xi: number, yi: number) => fr.o >= 0 && fr.o < n && (outerIsX ? xi === fr.o : yi === fr.o);

  const ov = pat.outer.v;
  const iv = pat.inner.v;
  const reading =
    pat.key === 'AE' ? `لكل ${ov} يوجد ${iv} بحيث` :
    pat.key === 'EA' ? `يوجد ${ov} بحيث لكل ${iv}:` :
    pat.key === 'AA' ? `لكل ${ov} ولكل ${iv}:` :
    `يوجد ${ov} ويوجد ${iv} بحيث`;
  const formula = `${pat.tex}\\; (${pr.tex})`;

  let explain = '';
  if (fr.verdict !== undefined) {
    if (fr.witness !== undefined) {
      const val = fmt(D[fr.witness]);
      explain = pat.outer.q === 'forall'
        ? `مثال مضاد: عند ${ov} = ${val} لم يتحقق الشرط الداخلي، فالعبارة كلها كاذبة. توقفنا دون أن نفحص بقية القيم.`
        : `شاهد: ${ov} = ${val} يحقق الشرط الداخلي، فالعبارة كلها صادقة. توقفنا دون أن نفحص بقية القيم.`;
    } else {
      explain = pat.outer.q === 'forall'
        ? `كل قيم ${ov} الـ ${n} حققت الشرط الداخلي، فالعبارة صادقة.`
        : `لا توجد قيمة لـ ${ov} تحقق الشرط الداخلي، فالعبارة كاذبة.`;
    }
  }

  return (
    <div className="widget card qg">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">المسوِّران المتداخلان حلقتان متداخلتان</span>
      </div>

      <div className="qg-controls">
        <div>
          <div className="qg-label">ترتيب المسوِّرين</div>
          <div className="tt-presets" dir="ltr">
            {PATTERNS.map((p) => (
              <button key={p.key} className={`tt-preset qg-btn ${p.key === pk ? 'on' : ''}`} onClick={() => setPk(p.key)}><Tex>{p.tex}</Tex></button>
            ))}
          </div>
        </div>
        <div>
          <div className="qg-label">الدالة القضوية P(x, y)</div>
          <div className="tt-presets" dir="ltr">
            {PREDICATES.map((p) => (
              <button key={p.key} className={`tt-preset ${p.key === rk ? 'on' : ''}`} onClick={() => setRk(p.key)}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="tt-formula">
        <Tex display>{`\\begin{gathered} ${formula} \\\\[2pt] \\small D = \\{${D.map(fmt).join(', ')}\\} \\end{gathered}`}</Tex>
      </div>
      <div className="qg-read">تُقرأ: {reading} <span className="ltr">{pr.label}</span></div>

      <div className="qg-grid-wrap table-scroll" dir="ltr">
        <table className="qg-grid">
          <thead>
            <tr>
              <th className="qg-corner"><span>x ↓</span><span>y →</span></th>
              {D.map((y, yi) => (
                <th key={yi} className={!outerIsX && fr.o === yi ? 'qg-outer' : ''}>{fmt(y)}</th>
              ))}
              {outerIsX && <th className="qg-res-h">{pat.inner.q === 'forall' ? '∀y?' : '∃y?'}</th>}
            </tr>
          </thead>
          <tbody>
            {D.map((x, xi) => (
              <tr key={xi}>
                <th className={outerIsX && fr.o === xi ? 'qg-outer' : ''}>{fmt(x)}</th>
                {D.map((y, yi) => {
                  const v = pr.f(x, y);
                  const seen = checkedSet.has(`${xi},${yi}`);
                  const now = cur && cur[0] === xi && cur[1] === yi;
                  return (
                    <td key={yi} className={`${v ? 'T' : 'F'} ${seen ? 'seen' : ''} ${now ? 'now' : ''} ${inOuter(xi, yi) ? 'band' : ''}`}>
                      {v ? 'T' : 'F'}
                    </td>
                  );
                })}
                {outerIsX && (
                  <td className="qg-res">{fr.results[xi] === undefined ? '' : fr.results[xi] ? '✓' : '✗'}</td>
                )}
              </tr>
            ))}
            {!outerIsX && (
              <tr>
                <th className="qg-res-h">{pat.inner.q === 'forall' ? '∀x?' : '∃x?'}</th>
                {D.map((_, yi) => <td key={yi} className="qg-res">{fr.results[yi] === undefined ? '' : fr.results[yi] ? '✓' : '✗'}</td>)}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="qg-legend">الخانات الباهتة لم تُفحص بعد. الحلقة الخارجية تمر على {outerIsX ? 'الصفوف' : 'الأعمدة'}، والداخلية على {outerIsX ? 'الأعمدة' : 'الصفوف'}.</div>

      <div className="tt-side">
        <Pseudocode lines={lines} active={fr.line} />
        <div className="tt-info">
          <div className="tt-counters">
            <span>عدد مرات حساب P: <b className="ltr">{fr.checks}</b> من <b className="ltr">{n * n}</b> ممكنة</span>
          </div>
          {fr.verdict !== undefined && (
            <div className={`tt-verdict ${fr.verdict ? 'v-T' : 'v-F'}`}>
              <strong>{fr.verdict ? 'صادقة' : 'كاذبة'}</strong>
              <div>{explain}</div>
            </div>
          )}
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

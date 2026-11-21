import { useMemo, useState } from 'react';
import { COST_ALGOS, lineTotal } from '../lib/cost';
import { Tex } from './MathText';

const SCALES = [10, 100, 1000, 10 ** 6];
const fmt = (v: number) => (Number.isInteger(v) ? v.toLocaleString('en') : v.toFixed(1));
const COLORS = ['var(--brand)', 'var(--amber)', 'var(--blue)'];

/** Line-by-line cost table: measured counts next to closed forms, T(n), extra space, and which term dominates. */
export default function CostTable() {
  const [key, setKey] = useState('sum');
  const A = COST_ALGOS.find((a) => a.key === key)!;
  const [idx, setIdx] = useState(8);
  const k = Math.min(idx, A.sizes.length - 1);
  const n = A.sizes[k];
  const m = useMemo(() => A.measure(n, 7), [A, n]);
  const total = lineTotal(m.counts);

  const pick = (k2: string) => {
    const B = COST_ALGOS.find((a) => a.key === k2)!;
    setKey(k2);
    setIdx(Math.min(idx, B.sizes.length - 1));
  };

  return (
    <div className="widget card ct">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول التكلفة: كم مرة يُنفَّذ كل سطر؟</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {COST_ALGOS.map((a) => <button key={a.key} className={`pr-tab ${a.key === key ? 'on' : ''}`} onClick={() => pick(a.key)}>{a.label}</button>)}
      </div>
      <div className="ct-size">
        <label>
          <span className="qg-label">{A.key === 'bits' ? 'N' : 'n'} = <b className="ltr">{n.toLocaleString('en')}</b></span>
          <input type="range" min={0} max={A.sizes.length - 1} value={k} onChange={(e) => setIdx(+e.target.value)} />
        </label>
        <span className="ct-note">{A.sizeNote}{A.key === 'bits' && <> — هنا <b className="ltr">b = {Math.floor(Math.log2(n)) + 1}</b></>}</span>
      </div>

      <div className="table-scroll" dir="ltr">
        <table className="nice ct-table">
          <thead><tr><th>#</th><th>السطر</th><th>عدد مرات التنفيذ</th><th>الصيغة</th></tr></thead>
          <tbody>
            {A.lines.map((l, i) => {
              const want = l.f ? l.f(n) + 0 : null;
              return (
                <tr key={i} className={i === 0 ? 'ct-head' : ''}>
                  <td className="ct-num">{i + 1}</td>
                  <td><code>{l.code}</code></td>
                  <td className="ct-count">{i === 0 ? '' : fmt(m.counts[i])}</td>
                  <td>{l.tex && <Tex>{l.tex}</Tex>}{want !== null && <span className={`ct-ok ${want === m.counts[i] ? '' : 'bad'}`}>{want === m.counts[i] ? '✓' : '✗'}</span>}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr><td /><td><b>المجموع</b></td><td className="ct-count"><b>{fmt(total)}</b></td><td><Tex>{A.total}</Tex></td></tr>
          </tfoot>
        </table>
      </div>

      <div className="ct-space">
        <div className="ct-space-head">
          <span>الذاكرة الإضافية:</span>
          <b className="ltr">{fmt(m.space)}</b> <span>خلية</span>
          <span className="ct-space-f"><Tex>{`S = ${A.space.tex}`}</Tex></span>
        </div>
        <div className="ct-space-bar"><i style={{ width: `${Math.min(100, (m.space / Math.max(m.space, 42)) * 100)}%` }} /></div>
        <div className="ct-note">{A.space.note}</div>
      </div>

      <div className="ct-dom">
        <div className="ct-dom-title">من يسيطر على <Tex>{A.key === 'bits' ? 'T' : 'T(n)'}</Tex> حين يكبر المدخل؟</div>
        {SCALES.map((s) => {
          const vals = A.terms.map((t) => Math.max(t.f(s), 0));
          const sum = vals.reduce((a, b) => a + b, 0);
          return (
            <div key={s} className="ct-dom-row">
              <span className="ct-dom-n ltr">{A.key === 'bits' ? 'N' : 'n'} = {s >= 10 ** 6 ? '10⁶' : s.toLocaleString('en')}</span>
              <div className="ct-dom-bar" dir="ltr">
                {vals.map((v, i) => <i key={i} style={{ width: `${(v / sum) * 100}%`, background: COLORS[i] }} title={`${((v / sum) * 100).toFixed(2)}%`} />)}
              </div>
              <span className="ct-dom-pct ltr">{((vals[0] / sum) * 100).toFixed(vals[0] / sum > 0.999 ? 3 : 1)}%</span>
            </div>
          );
        })}
        <div className="ct-dom-legend" dir="ltr">
          {A.terms.map((t, i) => <span key={i}><i style={{ background: COLORS[i] }} /><Tex>{t.tex}</Tex></span>)}
        </div>
        <div className="vm-help">النسبة على اليسار حصة الحد الأكبر من المجموع. حين يكبر المدخل تقترب من 100%: الحدود الأصغر والثوابت تختفي، ولهذا نكتب في الدرس التالي <Tex>{A.terms.length && A.key === 'triples' ? '\\Theta(n^3)' : A.key === 'pairs' ? '\\Theta(n^2)' : A.key === 'bits' ? '\\Theta(\\log N)' : '\\Theta(n)'}</Tex> ونتجاهل الباقي.</div>
      </div>
    </div>
  );
}

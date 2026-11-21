import { useState } from 'react';
import { master, masterExact, masterGrowth } from '../lib/recur';
import { Tex } from './MathText';

const DS = [0, 0.5, 1, 1.5, 2, 2.5, 3];
const PRESETS: { label: string; a: number; b: number; d: number; k?: number }[] = [
  { label: 'البحث الثنائي', a: 1, b: 2, d: 0 },
  { label: 'الترتيب بالدمج', a: 2, b: 2, d: 1 },
  { label: 'Karatsuba', a: 3, b: 2, d: 1 },
  { label: 'ضرب المصفوفات بالتقسيم', a: 8, b: 2, d: 2 },
  { label: 'Strassen', a: 7, b: 2, d: 2 },
  { label: 'T(n/2) + n', a: 1, b: 2, d: 1 },
  { label: '2T(n/2) + n log n', a: 2, b: 2, d: 1, k: 1 },
];
const fmt = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(3));

/** T(n) = a T(n/b) + n^d (log n)^k: which case, why, and a numerical check. */
export default function MasterLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [di, setDi] = useState(2);
  const [k, setK] = useState(0);
  const d = DS[di];
  const r = master(a, b, d, k);

  const L = 10; // n = b^L for the level picture
  const lv = Array.from({ length: L + 1 }, (_, i) => {
    const m = b ** (L - i);
    return a ** i * (m ** d) * (k ? Math.max(Math.log2(m), 1) ** k : 1);
  });
  const lmax = Math.max(...lv);

  const js = [6, 10, 14, 18, 22];
  const ratios = js.map((j) => masterExact(a, b, d, k, j) / masterGrowth(a, b, d, k, b ** j));

  const lo = Math.min(r.crit, d) - 0.5, hi = Math.max(r.crit, d) + 0.5;
  const P = (x: number) => `${((x - lo) / (hi - lo)) * 100}%`;
  const preset = (p: (typeof PRESETS)[number]) => { setA(p.a); setB(p.b); setDi(DS.indexOf(p.d)); setK(p.k ?? 0); };

  return (
    <div className="widget card ml">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">المبرهنة الرئيسية: أي الحالات الثلاث؟</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((p) => <button key={p.label} className={`tt-preset ${p.a === a && p.b === b && p.d === d && (p.k ?? 0) === k ? 'on' : ''}`} onClick={() => preset(p)}>{p.label}</button>)}
      </div>

      <div className="ml-eq"><Tex>{`T(n) = ${a === 1 ? '' : a}\\,T(n/${b}) + ${d === 0 ? '1' : d === 1 ? 'n' : `n^{${fmt(d)}}`}${k ? '\\log n' : ''}`}</Tex></div>

      <div className="ap-sliders">
        <label><span className="ltr">a = <b>{a}</b> (عدد الاستدعاءات)</span><input type="range" min={1} max={9} value={a} onChange={(e) => setA(+e.target.value)} /></label>
        <label><span className="ltr">b = <b>{b}</b> (نسبة التصغير)</span><input type="range" min={2} max={4} value={b} onChange={(e) => setB(+e.target.value)} /></label>
        <label><span className="ltr">d = <b>{fmt(d)}</b> (أس العمل غير الذاتي)</span><input type="range" min={0} max={DS.length - 1} value={di} onChange={(e) => setDi(+e.target.value)} /></label>
        <label className="ml-k"><input type="checkbox" checked={k === 1} onChange={(e) => setK(e.target.checked ? 1 : 0)} /> <span>اضرب العمل في <Tex>{'\\log n'}</Tex></span></label>
      </div>

      <div className="ml-line" dir="ltr">
        <div className="ml-track" />
        <div className="ml-pin crit" style={{ left: P(r.crit) }}><span>log<sub>{b}</sub> {a} = {fmt(r.crit)}</span></div>
        <div className="ml-pin d" style={{ left: P(d) }}><span>d = {fmt(d)}</span></div>
      </div>

      <div className="ml-cases">
        {[
          { c: 1, title: 'الحالة 1: الأوراق تسيطر', cond: 'd \\lt \\log_b a', ans: 'n^{\\log_b a}' },
          { c: 2, title: 'الحالة 2: كل المستويات متساوية', cond: 'd = \\log_b a', ans: k ? 'n^d \\log^{k+1} n' : 'n^d \\log n' },
          { c: 3, title: 'الحالة 3: الجذر يسيطر', cond: 'd \\gt \\log_b a', ans: k ? 'n^d \\log^k n' : 'n^d' },
        ].map((x) => (
          <div key={x.c} className={`ml-case ${r.case === x.c ? 'on' : ''}`}>
            <b>{x.title}</b>
            <div><Tex>{x.cond}</Tex></div>
            <div><Tex>{`T(n) = \\Theta(${x.ans})`}</Tex></div>
          </div>
        ))}
      </div>
      <div className="ml-answer">الجواب: <Tex>{`T(n) = ${r.thetaTex}`}</Tex></div>

      <div className="ml-levels">
        <div className="ct-dom-title">عمل كل مستوى في الشجرة (n = {b}<sup>{L}</sup>)، والنسبة بين المستويين المتتاليين <Tex>{`a/b^d = ${fmt(r.ratio)}`}</Tex></div>
        {lv.map((v, i) => (
          <div key={i} className="ct-dom-row">
            <span className="ct-dom-n ltr">level {i}</span>
            <div className="ct-dom-bar" dir="ltr"><i style={{ width: `${Math.max((v / lmax) * 100, 0.4)}%`, background: r.case === 1 ? 'var(--blue)' : r.case === 2 ? 'var(--amber)' : 'var(--brand)' }} /></div>
            <span className="ct-dom-pct ltr">{v >= 1e6 ? v.toExponential(1) : Math.round(v).toLocaleString('en')}</span>
          </div>
        ))}
      </div>

      <div className="table-scroll" dir="ltr">
        <table className="nice ml-table">
          <thead><tr><th>n</th>{js.map((j) => <th key={j}>{b}<sup>{j}</sup></th>)}</tr></thead>
          <tbody><tr><td>T(n) / prediction</td>{ratios.map((x, i) => <td key={i}>{x.toFixed(3)}</td>)}</tr></tbody>
        </table>
      </div>
      <div className="vm-help">الصف الأخير يحسب T(n) بالضبط من العلاقة (مع T(1) = 1) ويقسمه على الرتبة المتوقعة. إذا كانت المبرهنة صحيحة فالنسبة تستقر قرب ثابت موجب، وهذا معنى Θ.</div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { distinctArray, momGrid } from '../lib/mom';

const STEPS = [
  'المدخل مقسم كتلًا متتالية، كل كتلة عمود.',
  'نرتب كل عمود من الأعلى إلى الأسفل (للتوضيح فقط: الخوارزمية تحسب الوسيط فقط). الصف الأوسط هو الوسطاء.',
  'نرتب الأعمدة حسب وسيطها (للتوضيح فقط). الوسيط الأوسط بين الوسطاء هو mom، في مركز الشبكة.',
  'الزاوية العليا اليسرى كلها أصغر من mom، والسفلى اليمنى كلها أكبر. هذا مضمون لأي مدخل.',
];

/** The median-of-medians pivot drawn as Erickson's grid: why mom always discards a constant fraction. */
export default function MomGridLab() {
  const [b, setB] = useState(5);
  const [seed, setSeed] = useState(4);
  const [step, setStep] = useState(0);
  const n = b === 5 ? 35 : 27;
  const A = useMemo(() => distinctArray(n, seed), [n, seed]);
  const g = useMemo(() => momGrid(A, b), [A, b]);
  const cols = step <= 0 ? g.raw : step === 1 ? g.raw.map((c) => c.slice().sort((x, y) => x - y)) : g.cols;
  const guaranteed = b === 5 ? '3n/10' : 'n/3';
  const frac = g.smaller.size;
  const cls = (v: number, i: number) => {
    const out: string[] = [];
    if (step >= 1 && i === g.mid) out.push('med');
    if (step >= 2 && v === g.mom) out.push('mom');
    if (step >= 3 && g.smaller.has(v)) out.push('sm');
    if (step >= 3 && g.larger.has(v)) out.push('lg');
    return out.join(' ');
  };
  return (
    <div className="widget card mg">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">وسيط الوسطاء: لماذا هو محور جيد دائمًا؟</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">حجم الكتلة:</span>
        {[5, 3].map((v) => <button key={v} className={`tt-preset ${v === b ? 'on' : ''}`} onClick={() => { setB(v); setStep(0); }}>{v}</button>)}
        <button className="tt-preset" onClick={() => { setSeed(seed + 1); setStep(0); }} aria-label="مدخل جديد">🎲</button>
      </div>
      <div className="mg-grid" dir="ltr" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
        {cols.map((c, j) => (
          <div key={j} className={`mg-col ${step >= 2 && j === g.momCol ? 'momcol' : ''}`}>
            {c.map((v, i) => <span key={v} className={`mg-cell ${cls(v, i)}`}>{v}</span>)}
          </div>
        ))}
      </div>
      <div className={`inv-banner ${step >= 3 ? 'sq-ok' : 'on'}`}>{STEPS[step]}</div>
      {step >= 3 && (
        <div className="da-stats">
          <span>mom = <b className="ltr">{g.mom}</b>، ورتبته الحقيقية <b className="ltr">{g.rank}</b> من <b className="ltr">{n}</b></span>
          <span>مضمون أصغر منه: <b className="ltr">{frac}</b> (نحو <bdi dir="ltr">{guaranteed}</bdi>)</span>
          <span>فالاستدعاء التالي على <b className="ltr">{n - 1 - frac}</b> عنصرًا على الأكثر</span>
        </div>
      )}
      {step >= 3 && <div className="vm-help">{b === 5
        ? <>الاستدعاءان على <bdi dir="ltr">n/5</bdi> (لإيجاد mom) و<bdi dir="ltr">7n/10</bdi> على الأكثر: المجموع <bdi dir="ltr">9n/10 &lt; n</bdi>، فشجرة الاستدعاء متناقصة والزمن <bdi dir="ltr">O(n)</bdi>.</>
        : <>مع كتل من 3: الاستدعاءان على <bdi dir="ltr">n/3</bdi> و<bdi dir="ltr">2n/3</bdi>: المجموع n بالضبط، فكل مستوى n، والزمن <bdi dir="ltr">O(n log n)</bdi>. لا أفضل من الترتيب.</>}</div>}
      <div className="ps-n" style={{ justifyContent: 'center' }}>
        <button className="btn btn-sm" disabled={step === 0} onClick={() => setStep(step - 1)}>→ السابق</button>
        <button className="btn btn-sm btn-primary" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>التالي ←</button>
      </div>
    </div>
  );
}

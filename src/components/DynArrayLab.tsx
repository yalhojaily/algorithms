import { useMemo, useState } from 'react';
import { GROW, SHRINK, simulate, totalCost, type Grow, type Op, type Shrink } from '../lib/dynarray';

const MAXCELLS = 64;

/** Push and pop on a dynamic array; watch capacity, copies, per-operation cost and the running total. */
export default function DynArrayLab({ showShrink = true }: { showShrink?: boolean }) {
  const [grow, setGrow] = useState<Grow>('x2');
  const [shrink, setShrink] = useState<Shrink>('quarter');
  const [ops, setOps] = useState<Op[]>([]);
  const steps = useMemo(() => simulate(ops, grow, showShrink ? shrink : 'none'), [ops, grow, shrink, showShrink]);
  const last = steps[steps.length - 1];
  const size = last?.size ?? 0, cap = last?.cap ?? 1;
  const total = totalCost(steps);
  const maxOp = Math.max(0, ...steps.map((s) => s.cost));

  const add = (more: Op[]) => setOps([...ops, ...more].slice(-4000));
  const thrash = () => {
    // fill to exactly a power of two, then alternate push / pop at the boundary
    const target = Math.max(8, 2 ** Math.ceil(Math.log2(Math.max(size, 8))));
    const fill: Op[] = Array(Math.max(0, target - size)).fill('push');
    const flip: Op[] = [];
    for (let i = 0; i < 10; i++) flip.push('push', 'pop');
    add([...fill, ...flip]);
  };

  const shown = steps.slice(-60);
  const barMax = Math.max(1, ...shown.map((s) => s.cost));
  // cumulative cost curve
  const W = 560, H = 150, L = 46, B = 22, T = 10, R = 10;
  const cum: number[] = [];
  steps.reduce((a, s, i) => (cum[i] = a + s.cost), 0);
  const N = Math.max(steps.length, 1);
  const yTop = Math.max(3 * N, ...cum, 1);
  const X = (i: number) => L + (i / N) * (W - L - R);
  const Y = (v: number) => H - B - (v / yTop) * (H - B - T);

  return (
    <div className="widget card da">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">المصفوفة الديناميكية: السعة والنسخ والتكلفة</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {GROW.map((g) => <button key={g.key} className={`pr-tab ${g.key === grow ? 'on' : ''}`} onClick={() => setGrow(g.key)}>{g.label}</button>)}
      </div>
      {showShrink && (
        <div className="ps-n" style={{ flexWrap: 'wrap' }}>
          <span className="qg-label">عند الحذف:</span>
          {SHRINK.map((s) => <button key={s.key} className={`tt-preset ${s.key === shrink ? 'on' : ''}`} onClick={() => setShrink(s.key)}>{s.label}</button>)}
        </div>
      )}
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-sm" onClick={() => add(['push'])}>push</button>
        <button className="btn btn-sm" onClick={() => add(Array(10).fill('push'))}>push ×10</button>
        <button className="btn btn-sm" onClick={() => add(Array(100).fill('push'))}>push ×100</button>
        <button className="btn btn-sm" onClick={() => add(['pop'])} disabled={size === 0}>pop</button>
        <button className="btn btn-sm" onClick={() => add(Array(10).fill('pop'))} disabled={size === 0}>pop ×10</button>
        {showShrink && <button className="btn btn-sm" onClick={thrash}>⇄ تأرجح عند الحد</button>}
        <button className="btn btn-sm" onClick={() => setOps([])}>↺ من جديد</button>
      </div>

      <div className="da-mem" dir="ltr">
        {Array.from({ length: Math.min(cap, MAXCELLS) }, (_, i) => (
          <i key={i} className={i < size ? 'full' : ''} />
        ))}
        {cap > MAXCELLS && <em>… +{(cap - MAXCELLS).toLocaleString('en')} cells</em>}
      </div>
      <div className="da-stats">
        <div><span>الحجم n</span><b>{size}</b></div>
        <div><span>السعة</span><b>{cap}</b></div>
        <div><span>آخر عملية</span><b>{last ? (last.resized ? `${last.resized === 'grow' ? 'تكبير' : 'تصغير'}: نسخ ${last.copies}` : 'دون نسخ') : '—'}</b></div>
        <div><span>العمليات</span><b>{steps.length}</b></div>
        <div><span>التكلفة الكلية</span><b>{total}</b></div>
        <div><span>متوسط التكلفة للعملية</span><b>{steps.length ? (total / steps.length).toFixed(2) : '—'}</b></div>
        <div><span>أغلى عملية واحدة</span><b>{maxOp}</b></div>
      </div>

      <div className="ct-dom-title">تكلفة كل عملية (آخر 60)</div>
      <div className="da-bars" dir="ltr">
        {shown.map((s, i) => <i key={i} className={s.resized} style={{ height: `${(s.cost / barMax) * 100}%` }} title={`${s.op}: ${s.cost}`} />)}
      </div>

      <div className="ct-dom-title">التكلفة التراكمية مقابل 3 × عدد العمليات</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="lc-svg" style={{ direction: 'ltr' }}>
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} className="lc-axis" />
        <text x={L - 6} y={Y(yTop) + 4} textAnchor="end" className="lc-lbl">{Math.round(yTop)}</text>
        <text x={L - 6} y={H - B + 4} textAnchor="end" className="lc-lbl">0</text>
        <text x={W - R} y={H - 6} textAnchor="end" className="lc-lbl">{N} ops</text>
        <line x1={X(0)} y1={Y(0)} x2={X(N)} y2={Y(3 * N)} className="da-ref" />
        {steps.length > 0 && <polyline fill="none" className="da-cum" points={['0,0', ...cum.map((v, i) => `${i + 1},${v}`)].map((p) => { const [i, v] = p.split(',').map(Number); return `${X(i)},${Y(v)}`; }).join(' ')} />}
      </svg>
      <div className="vm-help">
        {grow === 'x2' || grow === 'x1.5'
          ? 'مع النمو بنسبة ثابتة يبقى المنحنى الأحمر تحت الخط المتقطع 3n: بعض العمليات غالية، لكن المجموع خطي.'
          : 'مع النمو بإضافة عدد ثابت ينحني المنحنى إلى الأعلى ويتجاوز أي خط مستقيم: المجموع تربيعي.'}
      </div>
    </div>
  );
}

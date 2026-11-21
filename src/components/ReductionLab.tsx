import { useMemo, useState } from 'react';
import { PROBLEMS, blackBox, type BoxKind, type ProblemKey } from '../lib/reduction';
import { mulberry32 } from '../lib/montecarlo';

const SIZES = [12, 200, 2000, 8000];

/** Four problems reduced to SORT. The sort is a black box that can be swapped without touching the reduction. */
export default function ReductionLab() {
  const [pk, setPk] = useState<ProblemKey>('dup');
  const [box, setBox] = useState<BoxKind>('insertion');
  const [n, setN] = useState(12);
  const [seed, setSeed] = useState(3);
  const [open, setOpen] = useState(false);
  const A = useMemo(() => { const r = mulberry32(seed * 31 + n); return Array.from({ length: n }, () => Math.floor(r() * n * 3)); }, [n, seed]);
  const P = PROBLEMS.find((p) => p.key === pk)!;
  const res = useMemo(() => {
    const out = (['insertion', 'merge'] as BoxKind[]).map((k) => { const b = blackBox(k, A); return { k, ...b, ...P.solve(b.sorted) }; });
    return out;
  }, [A, P]);
  const cur = res.find((r) => r.k === box)!;
  const other = res.find((r) => r.k !== box)!;
  const fmt = (x: number) => x.toLocaleString('en');
  return (
    <div className="widget card rd">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أربع مسائل، وصندوق أسود واحد</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {PROBLEMS.map((p) => <button key={p.key} className={`pr-tab ${p.key === pk ? 'on' : ''}`} onClick={() => setPk(p.key)}>{p.ar}</button>)}
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">n =</span>
        {SIZES.map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{fmt(v)}</button>)}
        <button className="tt-preset" onClick={() => setSeed(seed + 1)} aria-label="مدخل جديد">🎲</button>
      </div>

      <div className="rd-flow">
        <div className="rd-node">
          <div className="rd-cap">المدخل</div>
          <div className="rd-arr" dir="ltr">{A.slice(0, 12).join(', ')}{n > 12 ? ` … (${fmt(n)})` : ''}</div>
        </div>
        <div className="rd-arrow">←</div>
        <div className={`rd-node rd-box ${open ? 'open' : ''}`}>
          <div className="rd-cap">الصندوق الأسود: <span className="ltr">SORT</span></div>
          {open
            ? <div className="rd-inside">بداخله الآن: <b>{box === 'insertion' ? 'الترتيب بالإدراج' : 'الترتيب بالدمج'}</b></div>
            : <div className="rd-inside rd-magic">؟ يعمل «بالسحر» ؟</div>}
          <div className="rd-cost">مقارنات داخل الصندوق: <b className="ltr">{fmt(cur.comps)}</b></div>
        </div>
        <div className="rd-arrow">←</div>
        <div className="rd-node">
          <div className="rd-cap">عملنا نحن</div>
          <div className="rd-inside">{P.after}</div>
          <div className="rd-cost">خطوات خارج الصندوق: <b className="ltr">{fmt(cur.steps)}</b></div>
        </div>
      </div>

      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">ما بداخل الصندوق:</span>
        <button className={`tt-preset ${box === 'insertion' ? 'on' : ''}`} onClick={() => setBox('insertion')}>الإدراج</button>
        <button className={`tt-preset ${box === 'merge' ? 'on' : ''}`} onClick={() => setBox('merge')}>الدمج</button>
        <label className="uf-chk"><input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} /> افتح الصندوق</label>
      </div>

      <div className="da-stats">
        <span>السؤال: {P.question}</span>
        <span>الجواب: <b>{cur.answer}</b></span>
        <span>بالصندوق الآخر: <b>{other.answer}</b>، بـ <b className="ltr">{fmt(other.comps)}</b> مقارنة</span>
      </div>
      <div className={`inv-banner ${cur.answer === other.answer ? 'sq-ok' : 'sq-bad'}`}>
        {cur.answer === other.answer
          ? `الجواب نفسه مهما كان بداخل الصندوق: الصحة لا تعتمد إلا على أن الصندوق يرتب. أما الزمن فيعتمد عليه: ${fmt(Math.max(cur.comps, other.comps))} مقابل ${fmt(Math.min(cur.comps, other.comps))} مقارنة.`
          : 'اختلف الجوابان!'}
      </div>
    </div>
  );
}

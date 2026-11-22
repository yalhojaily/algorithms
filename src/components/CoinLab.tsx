import { useMemo, useState } from 'react';
import { DREAM, greedyBills, minBillsTable } from '../lib/dp';

const SETS: { ar: string; d: number[] }[] = [
  { ar: 'Dream-Dollars (التمرين 1)', d: DREAM },
  { ar: 'الريال: 1، 5، 10، 50، 100، 500', d: [1, 5, 10, 50, 100, 500] },
  { ar: '1، 3، 4', d: [1, 3, 4] },
];

/** Greedy change versus the dynamic-programming table, and the first amounts where greed loses. */
export default function CoinLab() {
  const [si, setSi] = useState(0);
  const d = SETS[si].d;
  const [k, setK] = useState(122);
  const K = 1000;
  const { M, bills } = useMemo(() => minBillsTable(K, d), [si]);
  const bad = useMemo(() => { const o: number[] = []; for (let x = 1; x <= K && o.length < 14; x++) if (greedyBills(x, d).length > M[x]) o.push(x); return o; }, [si]);
  const g = greedyBills(k, d), b = bills(k);
  const Row = ({ xs, cls }: { xs: number[]; cls: string }) => (
    <div className={`cn-row ${cls}`} dir="ltr">{xs.map((x, i) => <span key={i} className="cn-b">{x}</span>)}<b>{xs.length}</b></div>
  );
  return (
    <div className="widget card cn">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الجشع مقابل الجدول: أقل عدد من الأوراق النقدية</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {SETS.map((q, i) => <button key={i} className={`tt-preset ${i === si ? 'on' : ''}`} onClick={() => setSi(i)}>{q.ar}</button>)}
      </div>
      <div className="ap-sliders">
        <label><span>المبلغ k = <b>{k}</b></span><input type="range" min={1} max={K} value={k} onChange={(e) => setK(+e.target.value)} /></label>
      </div>
      <div className="cn-cmp">
        <div><div className="cn-h">الجشع: أكبر ورقة لا تتجاوز الباقي</div><Row xs={g} cls={g.length > b.length ? 'bad' : ''} /></div>
        <div><div className="cn-h">الأمثل: من جدول <bdi dir="ltr">MinBills[0 .. k]</bdi></div><Row xs={b} cls="good" /></div>
      </div>
      <div className="cn-bad">
        <span>مبالغ يخسر فيها الجشع:</span>
        {bad.length ? bad.map((x) => <button key={x} className="tt-preset" onClick={() => setK(x)}><span className="ltr">{x}</span></button>) : <b>لا شيء حتى {K}: هنا ينجح الجشع، وهذا نادر</b>}
      </div>
      <div className="vm-help">الجدول يحسب <bdi dir="ltr">MinBills[k] = 1 + min<sub>x ≤ k</sub> MinBills[k − x]</bdi> لكل مبلغ من 1 إلى k: جرّب كل ورقة أولى، ودع الجدول يجيب عن الباقي. وزمنه <bdi dir="ltr">O(k · #denominations)</bdi>.</div>
    </div>
  );
}

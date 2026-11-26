import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { NEGCYC_G, NEG_G, POS_G } from '../lib/sssp';
import type { G } from '../lib/bookgraphs';

type GName = 'pos' | 'neg' | 'cyc';
const GRAPHS: Record<GName, { g: G; label: string }> = {
  pos: { g: POS_G, label: 'أوزان موجبة' },
  neg: { g: NEG_G, label: 'حواف سالبة' },
  cyc: { g: NEGCYC_G, label: 'دورة سالبة' },
};
const fmt = (x: number) => (x === Infinity ? '∞' : String(x));

/** Ford's generic algorithm by hand: you choose which tense edge to relax. */
export default function FordLab() {
  const [gn, setGn] = useState<GName>('neg');
  const g = GRAPHS[gn].g, n = g.names.length;
  const init = useMemo(() => ({ dist: g.names.map((_, v) => (v === 0 ? 0 : Infinity)), pred: Array(n).fill(-1) as number[] }), [g, n]);
  const [st, setSt] = useState(init);
  const [count, setCount] = useState(0);
  const [last, setLast] = useState(-1);
  const reset = (k: GName) => { setGn(k); const G2 = GRAPHS[k].g; setSt({ dist: G2.names.map((_, v) => (v === 0 ? 0 : Infinity)), pred: Array(G2.names.length).fill(-1) }); setCount(0); setLast(-1); };
  const w = (k: number) => g.edges[k][2] ?? 1;
  const tense = g.edges.map((_, k) => k).filter((k) => st.dist[g.edges[k][0]] + w(k) < st.dist[g.edges[k][1]]);
  const relax = (k: number) => {
    const [u, v] = g.edges[k], dist = [...st.dist], pred = [...st.pred];
    dist[v] = dist[u] + w(k); pred[v] = u;
    setSt({ dist, pred }); setCount(count + 1); setLast(k);
  };
  const nm = (k: number) => `${g.names[g.edges[k][0]]}→${g.names[g.edges[k][1]]}`;
  return (
    <div className="widget card fd">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أنت الخوارزمية: أرخِ أي حافة مشدودة</span>
      </div>
      <div className="rel-tabs">
        {(Object.keys(GRAPHS) as GName[]).map((k) => <button key={k} className={`pr-tab ${gn === k ? 'on' : ''}`} onClick={() => reset(k)}>{GRAPHS[k].label}</button>)}
      </div>
      <GraphSvg g={g} st={{ directed: true, scale: 70, r: 15, weights: true,
        vClass: (v) => (v === 0 ? 'c1' : st.dist[v] < Infinity ? 'c2' : ''),
        eClass: (u, v) => { const k = g.edges.findIndex(([a, b]) => a === u && b === v); return k === last ? 'hot' : tense.includes(k) ? 'back' : st.pred[v] === u ? 'tree' : ''; },
        label: (v) => fmt(st.dist[v]),
      }} />
      <div className="vm-help">الحواف الحمراء المنقطة <b>مشدودة</b> (tense): <bdi dir="ltr">dist(u) + w(u→v) &lt; dist(v)</bdi>. والأحمر المتصل حواف pred. اختر أي حافة مشدودة:</div>
      <div className="mc-edges" dir="ltr">
        {tense.map((k) => <button key={k} onClick={() => relax(k)}>Relax {nm(k)}</button>)}
        {tense.length > 0 && <button onClick={() => relax(tense[Math.floor(Math.random() * tense.length)])}>🎲 any</button>}
      </div>
      <div className="da-stats">
        <span>إرخاءات: <b className="ltr">{count}</b></span>
        <span>حواف مشدودة: <b className="ltr">{tense.length}</b></span>
      </div>
      <div className="edl-msg">
        {tense.length === 0 ? <>لا حافة مشدودة: الخوارزمية توقفت، وكل <bdi dir="ltr">dist(v)</bdi> الآن طول أقصر مسار، وحواف pred شجرة أقصر المسارات. جرّب ترتيبًا آخر: النتيجة نفسها دائمًا.</>
          : gn === 'cyc' && count > 8 ? <>لاحظت؟ الأرقام لا تتوقف عن النزول. مع دورة سالبة قابلة للوصول، توجد حافة مشدودة <b>دائمًا</b>: الخوارزمية لا تتوقف أبدًا.</>
            : <>كل إرخاء يُنقص <bdi dir="ltr">dist(v)</bdi>، ولا يزيدها أبدًا. والترتيب لك.</>}
      </div>
      <button className="btn btn-sm" onClick={() => reset(gn)}>من جديد</button>
    </div>
  );
}

import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { PROJECTS, bestProjects, missing } from '../lib/flowapps';
import type { G } from '../lib/bookgraphs';

/** Project selection: choose a closed set by hand, then see the minimum cut that finds the best one. */
export default function ProjectLab() {
  const P = PROJECTS, nm = P.g.names, n = nm.length;
  const [sel, setSel] = useState<boolean[]>(nm.map(() => false));
  const [view, setView] = useState<'pick' | 'net'>('pick');
  const best = useMemo(() => bestProjects(P), []);
  const miss = missing(P, sel), profit = P.profit.reduce((a, w, v) => a + (sel[v] ? w : 0), 0);
  const toggle = (v: number) => setSel(sel.map((c, i) => (i === v ? !c : c)));
  const sign = (w: number) => (w > 0 ? `+${w}` : `−${-w}`);
  const netG: G = {
    names: [...nm, 's', 't'],
    xy: [...P.g.xy, [2.1, -1.4], [2.1, 3.0]],
    edges: best.E.map(([u, v]) => [u, v]),
  };
  return (
    <div className="widget card pj">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">اختيار المشاريع بأصغر قطع</span></div>
      <div className="rel-tabs">
        <button className={`pr-tab ${view === 'pick' ? 'on' : ''}`} onClick={() => setView('pick')}>اختر بنفسك</button>
        <button className={`pr-tab ${view === 'net' ? 'on' : ''}`} onClick={() => setView('net')}>الشبكة <bdi dir="ltr">G′</bdi> وأصغر قطع</button>
      </div>
      {view === 'pick' ? <>
        <div className="vm-help">انقر مشروعًا لتختاره أو تلغيه. الحافة <bdi dir="ltr">u→v</bdi> تعني: u يحتاج v. والحواف الحمراء شروط مكسورة.</div>
        <GraphSvg g={P.g} st={{ directed: true, scale: 72, r: 16, onClick: toggle,
          label: (v) => sign(P.profit[v]), labelBelow: (v) => P.profit[v] < 0,
          vClass: (v) => (sel[v] ? (P.profit[v] > 0 ? 'c1' : 'c4') : ''),
          eClass: (u, v) => (sel[u] && !sel[v] ? 'broken' : '') }} />
        <div className={`pj-verdict ${miss.length ? 'bad' : 'ok'}`}>
          {miss.length ? <>اختيار غير صالح: {miss.map(([u, v], i) => <span key={i}>{i > 0 && '، '}<bdi>{nm[u]}</bdi> يحتاج <bdi>{nm[v]}</bdi></span>)}.</>
            : <>اختيار صالح، ربحه <b className="ltr">{profit}</b>{profit === best.profit ? '. وهذا أكبر ربح ممكن!' : `. وأكبر ربح ممكن ${best.profit}.`}</>}
        </div>
        <div className="bb-pick">
          <button className="pr-tab" onClick={() => setSel(best.sel)}>أظهر الأفضل</button>
          <button className="pr-tab" onClick={() => setSel(nm.map(() => false))}>امسح</button>
        </div>
      </> : <>
        <GraphSvg g={netG} st={{ directed: true, scale: 72, r: 16,
          vClass: (v) => (v >= n ? '' : best.sel[v] ? 'c1' : 'c3'),
          eLabel: (u, v) => { const k = best.E.findIndex(([a, b]) => a === u && b === v); const c = best.E[k][2]; return c === Infinity ? '∞' : String(c); },
          eClass: (u, v) => { const k = best.E.findIndex(([a, b]) => a === u && b === v); const S = (x: number) => x === best.s || (x < n && best.sel[x]); return S(u) && !(v === best.s || (v < n && best.sel[v])) ? 'cut' : ''; } }} />
        <div className="edl-msg">
          الأخضر في S مع s: المشاريع المختارة. والحواف السوداء المتقطعة تعبر القطع، وكلها من نوعين: <bdi dir="ltr">s→v</bdi> لمشروع رابح متروك، و<bdi dir="ltr">u→t</bdi> لمشروع خاسر مختار. ولا حافة ∞ تعبر، فالاختيار صالح. سعة القطع <bdi dir="ltr">{best.cut}</bdi>، و<bdi dir="ltr">P = {best.positive}</bdi>، فالربح <bdi dir="ltr">P − ‖S, T‖ = {best.positive} − {best.cut} = {best.profit}</bdi>.
        </div>
      </>}
    </div>
  );
}

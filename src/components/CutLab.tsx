import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { WEIGHTED } from '../lib/bookgraphs';
import { kruskalFrames } from '../lib/mst';

/** Prim's lemma: pick any set S; the lightest edge leaving S is in the minimum spanning tree. */
export default function CutLab() {
  const g = WEIGHTED;
  const [S, setS] = useState<Set<number>>(new Set([0, 1]));
  const [show, setShow] = useState(false);
  const mst = useMemo(() => new Set(kruskalFrames(g).at(-1)!.F), [g]);
  const cross = g.edges.map((e, k) => k).filter((k) => S.has(g.edges[k][0]) !== S.has(g.edges[k][1]));
  const safe = cross.length ? cross.reduce((a, b) => (g.edges[a][2]! < g.edges[b][2]! ? a : b)) : -1;
  const idx = (u: number, v: number) => g.edges.findIndex(([a, b]) => (a === u && b === v) || (a === v && b === u));
  const toggle = (v: number) => { const t = new Set(S); if (t.has(v)) t.delete(v); else t.add(v); setS(t); };
  const nm = (k: number) => `${g.names[g.edges[k][0]]}${g.names[g.edges[k][1]]}`;
  return (
    <div className="widget card cut">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أخف حافة تعبر القطع</span>
      </div>
      <div className="vm-help">انقر الرؤوس لتضيفها إلى المجموعة S أو تخرجها منها. الحواف الكهرمانية تعبر بين S والباقي، والخضراء أخفها.</div>
      <GraphSvg g={g} st={{ scale: 70, r: 14, weights: true, onClick: toggle,
        vClass: (v) => (S.has(v) ? 'st-done' : ''),
        eClass: (u, v) => { const k = idx(u, v); return k === safe ? 'safe' : cross.includes(k) ? 'cut' : show && mst.has(k) ? 'mstghost' : ''; },
      }} />
      <label className="wf-all" style={{ marginBottom: 8 }}><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> أظهر الشجرة الصغرى (ظل أحمر)</label>
      <div className="da-stats">
        <span>|S| = <b className="ltr">{S.size}</b></span>
        <span>حواف عابرة: <b className="ltr">{cross.length}</b></span>
        {safe >= 0 && <span>أخفها: <bdi dir="ltr">{nm(safe)} ({g.edges[safe][2]})</bdi></span>}
      </div>
      <div className="edl-msg">
        {safe < 0 ? 'S خالية أو تحتوي كل الرؤوس: لا حواف عابرة. اختر مجموعة أخرى.'
          : <>أخف حافة عابرة <bdi dir="ltr">{nm(safe)}</bdi> {mst.has(safe) ? <b>في الشجرة الصغرى</b> : <b>ليست في الشجرة؟! هذا مستحيل</b>}، أيًا كانت S. وكل الحواف العابرة الأخرى في الشجرة: <bdi dir="ltr">{cross.filter((k) => k !== safe && mst.has(k)).map(nm).join(', ') || '—'}</bdi>.</>}
      </div>
    </div>
  );
}

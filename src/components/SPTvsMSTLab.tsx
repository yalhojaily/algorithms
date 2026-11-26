import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { WEIGHTED } from '../lib/bookgraphs';
import { kruskalFrames } from '../lib/mst';
import { undirectedSPT } from '../lib/sssp';

/** Figure 8.2 in spirit: one minimum spanning tree, but a different shortest-path tree for every source. */
export default function SPTvsMSTLab() {
  const g = WEIGHTED;
  const [s, setS] = useState(0);
  const mst = useMemo(() => new Set(kruskalFrames(g).at(-1)!.F), [g]);
  const { tree, dist } = useMemo(() => undirectedSPT(g, s), [g, s]);
  const spt = new Set(tree);
  const idx = (u: number, v: number) => g.edges.findIndex(([a, b]) => a === u && b === v);
  const common = tree.filter((k) => mst.has(k)).length;
  const w = (S: Iterable<number>) => [...S].reduce((a, k) => a + g.edges[k][2]!, 0);
  return (
    <div className="widget card spt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">شجرة أقصر المسارات ليست الشجرة الصغرى</span>
      </div>
      <div className="vm-help">انقر أي رأس ليكون المصدر s. الأحمر شجرة أقصر المسارات منه، والظل العريض الشجرة الصغرى (لا تتغير). والرقم فوق كل رأس بعده عن s.</div>
      <GraphSvg g={g} st={{ scale: 70, r: 14, weights: true, onClick: setS,
        vClass: (v) => (v === s ? 'sel c1' : ''),
        eClass: (u, v) => { const k = idx(u, v); return spt.has(k) ? 'tree' : mst.has(k) ? 'mstghost' : ''; },
        label: (v) => String(dist[v]),
      }} />
      <div className="da-stats">
        <span>المصدر: <b className="ltr">{g.names[s]}</b></span>
        <span>حواف مشتركة: <b className="ltr">{common}</b> من {g.names.length - 1}</span>
        <span>وزن الشجرة الصغرى: <b className="ltr">{w(mst)}</b></span>
        <span>وزن شجرة المسارات: <b className="ltr">{w(spt)}</b></span>
      </div>
      <div className="edl-msg">الشجرتان كلتاهما «مثلى»، لكن لسؤالين مختلفين: الصغرى تقلل <b>مجموع</b> الحواف، وشجرة المسارات تقلل <b>بعد كل رأس عن s</b>. فشجرة المسارات أثقل عادةً، وتتغير مع المصدر.</div>
    </div>
  );
}

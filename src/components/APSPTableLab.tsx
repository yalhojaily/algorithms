import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import AMat, { fmtW } from './AMat';
import { APSP_G, floydWithPred, pathFrom } from '../lib/apsp';

/** The two V × V outputs: dist[u, v] and pred[u, v]. Click a cell to see its path. */
export default function APSPTableLab() {
  const g = APSP_G, nm = g.names;
  const { D, P } = useMemo(() => floydWithPred(g), [g]);
  const [sel, setSel] = useState<[number, number]>([0, 2]);
  const [tab, setTab] = useState<'dist' | 'pred'>('dist');
  const path = pathFrom(P, sel[0], sel[1]);
  const onPath = (u: number, v: number) => !!path && path.some((x, i) => i > 0 && path[i - 1] === u && x === v);
  const PM = P.map((r) => r.map((x) => x));
  return (
    <div className="widget card apt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدولان بحجم V × V</span>
      </div>
      <GraphSvg g={g} st={{ directed: true, scale: 70, r: 15, weights: true,
        vClass: (v) => (v === sel[0] ? 'c1 sel' : v === sel[1] ? 'c2 sel' : path?.includes(v) ? 'c4' : ''),
        eClass: (u, v) => (onPath(u, v) ? 'tree' : '') }} />
      <div className="rel-tabs">
        <button className={`pr-tab ${tab === 'dist' ? 'on' : ''}`} onClick={() => setTab('dist')}>dist[u, v]</button>
        <button className={`pr-tab ${tab === 'pred' ? 'on' : ''}`} onClick={() => setTab('pred')}>pred[u, v]</button>
      </div>
      <div className="vm-help">الصف المصدر u، والعمود الهدف v. انقر أي خانة.</div>
      {tab === 'dist'
        ? <AMat M={D} names={nm} onClick={(i, j) => setSel([i, j])} cls={(i, j) => (i === sel[0] && j === sel[1] ? 'sel' : '')} />
        : (
          <div className="apm-wrap">
            <table className="apm-mat" dir="ltr">
              <thead><tr><th />{nm.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>
              <tbody>{PM.map((row, i) => (
                <tr key={i}><th>{nm[i]}</th>{row.map((x, j) => <td key={j} className={`click ${x < 0 ? 'inf' : ''} ${i === sel[0] && j === sel[1] ? 'sel' : ''}`} onClick={() => setSel([i, j])}>{x < 0 ? '·' : nm[x]}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        )}
      <div className="edl-msg">
        {sel[0] === sel[1] ? <><bdi dir="ltr">dist({nm[sel[0]]}, {nm[sel[0]]}) = 0</bdi> وpred فارغ: المسار بلا حواف.</>
          : !path ? <>لا مسار من {nm[sel[0]]} إلى {nm[sel[1]]}: <bdi dir="ltr">dist = ∞</bdi> وpred فارغ.</>
            : <>أقصر مسار <bdi dir="ltr">{path.map((x) => nm[x]).join(' → ')}</bdi> طوله <b className="ltr">{fmtW(D[sel[0]][sel[1]])}</b>. واستُخرج من الجدول pred بالرجوع من {nm[sel[1]]}: <bdi dir="ltr">pred[{nm[sel[0]]}, {nm[sel[1]]}] = {nm[P[sel[0]][sel[1]]]}</bdi>، ثم pred لذلك، وهكذا.</>}
      </div>
    </div>
  );
}

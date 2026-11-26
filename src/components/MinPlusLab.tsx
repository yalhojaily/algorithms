import { useMemo, useState } from 'react';
import AMat, { fmtW } from './AMat';
import { APSP_G, minPlus, weightMatrix } from '../lib/apsp';

/** Funny matrix multiplication: (A ⊗ B)[i, j] = min_k (A[i, k] + B[k, j]). Click a cell of the product. */
export default function MinPlusLab() {
  const g = APSP_G, nm = g.names, n = nm.length;
  const W = useMemo(() => weightMatrix(g), [g]);
  const P = useMemo(() => minPlus(W, W), [W]);
  const [sel, setSel] = useState<[number, number]>([0, 2]);
  const [i, j] = sel;
  const terms = W[i].map((a, k) => a + W[k][j]);
  const best = terms.indexOf(Math.min(...terms));
  return (
    <div className="widget card mp">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ضرب المصفوفات «المضحك»</span>
      </div>
      <div className="vm-help">انقر خانة في الناتج <bdi dir="ltr">W ⊗ W</bdi> لترى من أين جاءت.</div>
      <div className="apm-two">
        <div><div className="apm-cap">W (الصف {nm[i]} بنفسجي)</div><AMat M={W} names={nm} cls={(a, b) => (a === i ? 'term' : '')} /></div>
        <div><div className="apm-cap">W (العمود {nm[j]} بنفسجي)</div><AMat M={W} names={nm} cls={(a, b) => (b === j ? 'term' : '')} /></div>
      </div>
      <div className="apm-cap">W ⊗ W: أقصر المسارات بحافتين على الأكثر</div>
      <AMat M={P} names={nm} onClick={(a, b) => setSel([a, b])} cls={(a, b) => (a === i && b === j ? 'sel' : '')} />
      <div className="mp-terms" dir="ltr">
        {terms.map((t, k) => <span key={k} className={k === best ? 'best' : ''}>{fmtW(W[i][k])} + {fmtW(W[k][j])} = {fmtW(t)} <small>(via {nm[k]})</small></span>)}
      </div>
      <div className="edl-msg">
        <bdi dir="ltr">(W ⊗ W)[{nm[i]}, {nm[j]}] = min over k of (W[{nm[i]}, k] + W[k, {nm[j]}]) = {fmtW(P[i][j])}</bdi>. كل حد مسار من {nm[i]} إلى k (حافة أو بقاء، لأن القطر صفر) ثم من k إلى {nm[j]}. والضرب العادي يجمع الحدود ({n} حدود) بدل أن يأخذ أصغرها.
      </div>
    </div>
  );
}

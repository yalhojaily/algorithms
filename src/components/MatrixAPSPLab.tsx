import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import AMat from './AMat';
import { APSP_G, floydFrames, shimbelFrames, squaringFrames, type MatFrame } from '../lib/apsp';
import { Player, useStepper } from '../engine/stepper';

type Algo = 'shimbel' | 'squaring' | 'floyd';
const LABEL: Record<Algo, string> = { shimbel: 'Shimbel: حافة إضافية', squaring: 'Fischer–Meyer: تربيع', floyd: 'Floyd–Warshall' };

/** The dynamic-programming APSP algorithms as a sequence of V × V matrices; changed cells are highlighted. */
export default function MatrixAPSPLab({ algo: a0 = 'shimbel' }: { algo?: Algo }) {
  const g = APSP_G, nm = g.names, n = nm.length;
  const [algo, setAlgo] = useState<Algo>(a0);
  const frames = useMemo(() => (algo === 'shimbel' ? shimbelFrames(g) : algo === 'squaring' ? squaringFrames(g) : floydFrames(g)), [algo, g]);
  const s = useStepper<MatFrame>(frames, 1);
  const f = s.frame;
  const changed = f.D.flatMap((r, i) => r.map((x, j) => (x !== f.prev[i][j] ? 1 : 0))).reduce((a: number, b: number) => a + b, 0);
  const work = algo === 'shimbel' ? `${frames.length - 1} × V·E` : algo === 'squaring' ? `${frames.length - 1} × V³` : `V × V² = ${n}³`;
  const msg = (() => {
    if (algo === 'shimbel') return s.i === 0 ? <>البداية: <bdi dir="ltr">D₁</bdi> مصفوفة الأوزان: مسارات بحافة واحدة على الأكثر.</> : <><bdi dir="ltr">D<sub>{f.step}</sub> = D<sub>{f.step - 1}</sub> ⊗ W</bdi>: كل مسار يطول بحافة واحدة. تغيرت {changed} خانات.</>;
    if (algo === 'squaring') return s.i === 0 ? <>البداية: <bdi dir="ltr">D₁ = W</bdi>.</> : <><bdi dir="ltr">D<sub>{2 ** f.step}</sub> = D<sub>{2 ** (f.step - 1)}</sub> ⊗ D<sub>{2 ** (f.step - 1)}</sub></bdi>: عدد الحواف المسموح يتضاعف. تغيرت {changed} خانات.</>;
    return s.i === 0 ? <>البداية: لا رؤوس وسيطة مسموحة: الحواف المباشرة فقط.</> : <>الآن يُسمح بالمرور بـ {nm[f.pivot!]} أيضًا: <bdi dir="ltr">dist[u, v] ← min(dist[u, v], dist[u, {nm[f.pivot!]}] + dist[{nm[f.pivot!]}, v])</bdi>. الصف والعمود الأزرقان لا يتغيران أبدًا في هذه الجولة. تغيرت {changed} خانات.</>;
  })();
  return (
    <div className="widget card mx">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ثلاث برمجات ديناميكية لكل الأزواج</span>
      </div>
      <div className="rel-tabs">
        {(Object.keys(LABEL) as Algo[]).map((a) => <button key={a} className={`pr-tab ${algo === a ? 'on' : ''}`} onClick={() => setAlgo(a)}>{LABEL[a]}</button>)}
      </div>
      <div className="apm-two">
        <GraphSvg g={g} st={{ directed: true, scale: 56, r: 13, weights: true, vClass: (v) => (v === f.pivot ? 'c2 sel' : '') }} />
        <div>
          <div className="apm-cap">{f.label}</div>
          <AMat M={f.D} names={nm} piv={f.pivot} cls={(i, j) => (f.D[i][j] !== f.prev[i][j] ? 'chg' : '')} />
        </div>
      </div>
      <div className="edl-msg">{msg}</div>
      <div className="da-stats">
        <span>الجولات: <b className="ltr">{frames.length - 1}</b></span>
        <span>العمل: <bdi dir="ltr">{work}</bdi></span>
      </div>
      <Player s={s} />
    </div>
  );
}

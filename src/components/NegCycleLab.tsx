import { useState } from 'react';
import GraphSvg from './GraphSvg';
import type { G } from '../lib/bookgraphs';

/** Figure 8.3 in spirit: a walk that goes around a negative cycle k times gets shorter and shorter. */
export default function NegCycleLab() {
  const [x, setX] = useState(-4);
  const g: G = { names: 'sabct'.split(''), xy: [[0, 1], [1.4, 0], [2.8, 1], [1.4, 2], [4.2, 1]],
    edges: [[0, 1, 2], [1, 2, 1], [2, 3, x], [3, 1, 2], [2, 4, 3]] };
  const cyc = 1 + x + 2;
  const walk = (k: number) => 2 + 1 + k * cyc + 3;
  return (
    <div className="widget card nc">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">دورة سالبة: لا أقصر مشي</span>
      </div>
      <div className="ap-sliders">
        <label>وزن الحافة <bdi dir="ltr">b→c</bdi>: <b className="ltr">{x}</b>
          <input type="range" min={-8} max={4} value={x} onChange={(e) => setX(Number(e.target.value))} /></label>
      </div>
      <GraphSvg g={g} st={{ directed: true, scale: 70, r: 14, weights: true,
        eClass: (u, v) => ((u === 1 && v === 2) || (u === 2 && v === 3) || (u === 3 && v === 1) ? (cyc < 0 ? 'back' : 'tree') : '') }} />
      <div className="da-stats">
        <span>وزن الدورة <bdi dir="ltr">a→b→c→a</bdi>: <b className="ltr">{cyc}</b></span>
        {[0, 1, 2, 3, 10].map((k) => <span key={k}>مشي يدور {k} مرة: <b className="ltr">{walk(k)}</b></span>)}
      </div>
      <div className="edl-msg">
        {cyc < 0 ? <>الدورة سالبة، وs يصل إليها، وt قابل للوصول منها. فكل دورة إضافية تُنقص الطول {Math.abs(cyc)}: <b>لا أقصر مشي من s إلى t</b>، والمسافة −∞.</>
          : cyc === 0 ? <>الدورة صفرية: الدوران لا يغير الطول. أقصر مشي موجود ({walk(0)})، وهو مسار بسيط.</>
            : <>الدورة موجبة: الدوران يزيد الطول. أقصر مشي هو المسار البسيط بطول {walk(0)}.</>}
      </div>
    </div>
  );
}

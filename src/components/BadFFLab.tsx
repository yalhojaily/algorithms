import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { badNet } from '../lib/flow';
import { Player, useStepper } from '../engine/stepper';

/** Figure 10.7: alternating s→u→v→t and s→v→u→t pushes one unit at a time: 2X iterations. */
export default function BadFFLab() {
  const [X, setX] = useState(6);
  const net = useMemo(() => badNet(X), [X]);
  // edges: su sv uv ut vt
  const frames = useMemo(() => {
    const out: { f: number[]; path: string }[] = [{ f: [0, 0, 0, 0, 0], path: '' }];
    let f = [0, 0, 0, 0, 0];
    for (let i = 0; i < 2 * X; i++) {
      f = i % 2 === 0 ? [f[0] + 1, f[1], f[2] + 1, f[3], f[4] + 1] : [f[0], f[1] + 1, f[2] - 1, f[3] + 1, f[4]];
      out.push({ f, path: i % 2 === 0 ? 's→u→v→t' : 's→v→u→t' });
    }
    return out;
  }, [X]);
  const s = useStepper(frames, 4);
  const fr = s.frame;
  const idx = (u: number, v: number) => net.edges.findIndex(([a, b]) => a === u && b === v);
  return (
    <div className="widget card bf">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">مثال Edmonds وKarp السيئ</span></div>
      <div className="ap-sliders"><label>X: <b className="ltr">{X}</b><input type="range" min={1} max={20} value={X} onChange={(e) => setX(Number(e.target.value))} /></label></div>
      <GraphSvg g={net} st={{ directed: true, scale: 80, r: 15,
        eLabel: (u, v) => { const k = idx(u, v); return `${fr.f[k]}/${net.edges[k][2]}`; },
        eClass: (u, v) => (u === 1 && v === 2 ? 'hot' : '') }} />
      <div className="edl-msg">
        {s.i === 0 ? <>أكبر تدفق واضح: <b className="ltr">2X = {2 * X}</b>، بمسارين فقط: <bdi dir="ltr">s→u→t</bdi> و<bdi dir="ltr">s→v→t</bdi>.</>
          : <>التكرار {s.i}: <bdi dir="ltr">{fr.path}</bdi>، بوحدة واحدة فقط، لأن الحافة الوسطى <bdi dir="ltr">u→v</bdi> سعتها 1 وهي في كل مسار، مرة للأمام ومرة للخلف.</>}
      </div>
      <div className="da-stats">
        <span>تكرارات هذا الاختيار السيئ: <b className="ltr">{2 * X}</b></span>
        <span>تكرارات أقصر المسارات (BFS): <b className="ltr">2</b></span>
        <span>بتات المدخل: نحو <bdi dir="ltr">5 lg X</bdi></span>
      </div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { randomTree, treeMISFrames, type MFrame } from '../lib/dp';
import { Player, useStepper } from '../engine/stepper';

/** TreeMIS2 in post-order: every node stores (yes, no); the root's max is the answer. */
export default function TreeMISLab() {
  const [seed, setSeed] = useState(7);
  const [n, setN] = useState(14);
  const { nodes, width } = useMemo(() => randomTree(n, seed), [n, seed]);
  const { frames, chosen } = useMemo(() => treeMISFrames(nodes), [nodes]);
  const s = useStepper<MFrame>(frames, 3);
  const f = s.frame;
  const done = frames.indexOf(f) === frames.length - 1;
  const depth = Math.max(...nodes.map((v) => v.depth));
  const W = Math.max(320, width * 52), H = (depth + 1) * 70 + 30;
  const X = (x: number) => 20 + (x + 0.5) * ((W - 40) / width);
  const Y = (d: number) => 30 + d * 70;
  return (
    <div className="widget card tml">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أكبر مجموعة مستقلة في شجرة: من الأوراق إلى الجذر</span>
      </div>
      <div className="ap-sliders">
        <label><span>عدد العقد <b>{n}</b></span><input type="range" min={5} max={22} value={n} onChange={(e) => setN(+e.target.value)} /></label>
        <button className="btn btn-sm" onClick={() => setSeed(seed + 1)}>شجرة أخرى</button>
      </div>
      <div className="sst-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 620), display: 'block', width: '100%' }} direction="ltr">
          {nodes.filter((v) => v.parent >= 0).map((v) => (
            <line key={`e${v.id}`} x1={X(nodes[v.parent].x)} y1={Y(nodes[v.parent].depth) + 14} x2={X(v.x)} y2={Y(v.depth) - 14} className="fbt-e" />
          ))}
          {nodes.map((v) => {
            const y = f.yes[v.id], z = f.no[v.id];
            return (
              <g key={v.id} className={`tml-n ${y !== null ? 'done' : ''} ${f.v === v.id ? 'cur' : ''} ${done && chosen.has(v.id) ? 'in' : ''}`}>
                <circle cx={X(v.x)} cy={Y(v.depth)} r={14} />
                {y !== null && <text x={X(v.x)} y={Y(v.depth) + 27} textAnchor="middle" className="tml-yn"><tspan className="y">{y}</tspan>/<tspan className="z">{z}</tspan></text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="edl-msg">
        {f.v < 0 ? 'نزور العقد بترتيب لاحق (post-order): كل عقدة بعد أبنائها.'
          : done ? <>الجواب <bdi dir="ltr">max(MISyes, MISno) = {Math.max(f.yes[0]!, f.no[0]!)}</bdi> عند الجذر. العقد الملونة مجموعة مستقلة بهذا الحجم، استُخرجت من الأعلى إلى الأسفل.</>
          : <>تحت كل عقدة: <span className="tml-k y">MISyes</span> (العقدة فيها: 1 + مجموع MISno للأبناء) / <span className="tml-k z">MISno</span> (ليست فيها: مجموع الأكبر لكل ابن).</>}
      </div>
      <div className="da-stats"><span>عقد محسوبة: <b className="ltr">{frames.indexOf(f)}</b> من <b className="ltr">{n}</b> · زمن <bdi dir="ltr">O(n)</bdi></span></div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { cpFrames, sortedPoints, type CPFrame, type P2 } from '../lib/closestpair';
import { mulberry32 } from '../lib/montecarlo';
import { Player, record, useStepper } from '../engine/stepper';
import MixText from './MixText';

const W = 420, H = 260;

/** Closest pair by divide and conquer: the dividing line, δ, the strip, and the few comparisons inside it. */
export default function ClosestPairLab() {
  const [n, setN] = useState(24);
  const [seed, setSeed] = useState(5);
  const P0 = useMemo<P2[]>(() => { const r = mulberry32(seed * 13 + n); return Array.from({ length: n }, () => [15 + r() * (W - 30), 15 + r() * (H - 30)]); }, [n, seed]);
  const P = useMemo(() => sortedPoints(P0), [P0]);
  const frames = useMemo(() => record(cpFrames(P0), 20000), [P0]);
  const s = useStepper<CPFrame>(frames, 4);
  const f = s.frame;
  const strip = new Set(f.strip);
  const brute = (n * (n - 1)) / 2;
  return (
    <div className="widget card cp">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أقرب زوج من النقاط</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">النقاط:</span>
        {[12, 24, 48].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        <button className="tt-preset" onClick={() => setSeed(seed + 1)} aria-label="نقاط جديدة">🎲</button>
      </div>
      <svg className="cp-svg" viewBox={`0 0 ${W} ${H}`} direction="ltr">
        {!f.done && f.lo > 0 && <rect x={0} y={0} width={P[f.lo][0] - 4} height={H} className="cp-out" />}
        {!f.done && f.hi < n && <rect x={P[f.hi - 1][0] + 4} y={0} width={W - P[f.hi - 1][0] - 4} height={H} className="cp-out" />}
        {f.midX !== null && isFinite(f.delta) && <rect x={f.midX - f.delta} y={0} width={2 * f.delta} height={H} className="cp-strip" />}
        {f.midX !== null && <line x1={f.midX} x2={f.midX} y1={0} y2={H} className="cp-mid" />}
        {f.best && <line x1={P[f.best[0]][0]} y1={P[f.best[0]][1]} x2={P[f.best[1]][0]} y2={P[f.best[1]][1]} className="cp-best" />}
        {f.pair && !f.done && <line x1={P[f.pair[0]][0]} y1={P[f.pair[0]][1]} x2={P[f.pair[1]][0]} y2={P[f.pair[1]][1]} className="cp-pair" />}
        {P.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={4.5} className={`cp-pt ${strip.has(i) ? 'st' : ''} ${f.best && (f.best[0] === i || f.best[1] === i) ? 'bp' : ''}`} />
        ))}
      </svg>
      <div className="gc-legend">
        <span className="gc-key ar"><i className="cp-sw mid" /> خط التقسيم</span>
        <span className="gc-key ar"><i className="cp-sw strip" /> الشريط بعرض 2δ</span>
        <span className="gc-key ar"><i className="cp-sw pair" /> المقارنة الحالية</span>
        <span className="gc-key ar"><i className="cp-sw best" /> أقرب زوج حتى الآن</span>
      </div>
      <div className="da-stats">
        <span>حسابات المسافة: <b className="ltr">{f.comps}</b> / <b className="ltr">{frames[frames.length - 1].comps}</b></span>
        <span>القوة الغاشمة: <b className="ltr">{brute}</b></span>
        <span>عمق الاستدعاء: <b className="ltr">{f.depth}</b></span>
      </div>
      <div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}><MixText text={f.note} /></div>
      <Player s={s} />
    </div>
  );
}

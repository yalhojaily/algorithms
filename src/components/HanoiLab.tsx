import { useMemo, useState } from 'react';
import { PEG, hanoiFrames, type HFrame } from '../lib/hanoi';
import { Player, useStepper } from '../engine/stepper';

const COLORS = ['#b3263a', '#d9822b', '#c9a227', '#2e8b57', '#2f62c9', '#7a4cc2', '#8d4b8a', '#4a7c8c'];

/** Tower of Hanoi played move by move, with the chain of recursive calls behind each move. */
export default function HanoiLab() {
  const [n, setN] = useState(4);
  const frames = useMemo(() => hanoiFrames(n), [n]);
  const s = useStepper<HFrame>(frames, n <= 4 ? 1.5 : 4);
  const f = s.frame;
  const W = 520, H = 40 + n * 22 + 30, pegX = [W / 6, W / 2, (5 * W) / 6], base = H - 24;
  const dw = (d: number) => 30 + (d / n) * 110;
  return (
    <div className="widget card hn">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أبراج هانوي: الحركة ومن وراءها</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">عدد الأقراص n =</span>
        {[1, 2, 3, 4, 5, 6, 7].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
      </div>
      <svg className="hn-svg" viewBox={`0 0 ${W} ${H}`} direction="ltr">
        <rect x={10} y={base} width={W - 20} height={10} rx={4} className="hn-base" />
        {pegX.map((x, i) => (
          <g key={i}>
            <rect x={x - 4} y={base - n * 22 - 26} width={8} height={n * 22 + 26} rx={3} className="hn-peg" />
            <text x={x} y={H - 2} textAnchor="middle" className="hn-lbl">{PEG[i]}</text>
          </g>
        ))}
        {f.pegs.flatMap((p, i) => p.map((d, h) => (
          <rect key={`${d}`} x={pegX[i] - dw(d) / 2} y={base - (h + 1) * 22} width={dw(d)} height={19} rx={7}
            style={{ fill: COLORS[(d - 1) % COLORS.length] }} className={`hn-disk ${f.move && f.move.disk === d ? 'moved' : ''}`} />
        )))}
        {f.pegs.flatMap((p, i) => p.map((d, h) => <text key={`t${d}`} x={pegX[i]} y={base - (h + 1) * 22 + 14} textAnchor="middle" className="hn-dl">{d}</text>))}
      </svg>
      <div className="da-stats">
        <span>النقلات: <b className="ltr">{f.k}</b> من <bdi dir="ltr">2<sup>{n}</sup> − 1 = {f.total}</bdi></span>
        <span>{f.move ? <>نقلنا القرص <b className="ltr">{f.move.disk}</b> من <b className="ltr">{PEG[f.move.from]}</b> إلى <b className="ltr">{PEG[f.move.to]}</b></> : 'كل الأقراص على A، والهدف C'}</span>
      </div>
      <div className="hn-stack" dir="ltr">
        <div className="hn-stack-cap" dir="rtl">سلسلة الاستدعاءات المفتوحة الآن (من الخارج إلى الداخل):</div>
        {(f.move?.stack ?? [`Hanoi(${n}, A, C, B)`]).map((c, i, arr) => (
          <div key={i} className={`hn-call ${i === arr.length - 1 ? 'cur' : ''}`} style={{ paddingLeft: 8 + i * 16 }}>{c}{i === arr.length - 1 && f.move ? `  ⟶  move disk ${f.move.disk}` : ''}</div>
        ))}
      </div>
      <div className="vm-help">لاحظ أن القرص الأكبر يتحرك مرة واحدة فقط، في المنتصف تمامًا، وأن كل ما قبله وما بعده نسختان من حل n − 1. وكل نقلة يقوم بها الاستدعاء الأعمق الذي ما زال مفتوحًا.</div>
      <Player s={s} />
    </div>
  );
}

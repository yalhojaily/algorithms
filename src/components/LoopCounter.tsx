import { useMemo, useState } from 'react';
import { PATTERNS, type PatternKey } from '../lib/loops';
import { Player, Pseudocode, useStepper } from '../engine/stepper';
import { Tex } from './MathText';

interface Frame { done: number; total: number; line: number }

/** Every loop is a sum: each bar is one outer iteration, its height the inner work. Watch the area add up. */
export default function LoopCounter() {
  const [pk, setPk] = useState<PatternKey>('tri');
  const [n, setN] = useState(16);
  const P = PATTERNS.find((p) => p.key === pk)!;
  const bars = useMemo(() => P.bars(n), [P, n]);
  const frames = useMemo<Frame[]>(() => {
    const out: Frame[] = [{ done: 0, total: 0, line: 1 }];
    let t = 0;
    bars.forEach((b, i) => { t += b.h; out.push({ done: i + 1, total: t, line: P.code.length > 3 ? 3 : 2 }); });
    out.push({ done: bars.length, total: t, line: 1 });
    return out;
  }, [bars, P]);
  const s = useStepper<Frame>(frames, 6);
  const fr = s.frame;

  const W = 560, HH = 220, pad = 24;
  const maxH = Math.max(...bars.map((b) => b.h), 1);
  const bw = (W - 2 * pad) / Math.max(bars.length, 1);
  const scale = (HH - 2 * pad) / maxH;
  const finished = fr.done === bars.length && fr.done > 0;

  return (
    <div className="widget card lc">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">كل حلقة مجموع: احسب المساحة</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {PATTERNS.map((p) => <button key={p.key} className={`pr-tab ${p.key === pk ? 'on' : ''}`} onClick={() => setPk(p.key)}>{p.label}</button>)}
      </div>
      <div className="ps-n">
        <span className="qg-label">n =</span>
        {[8, 16, 32].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
      </div>

      <svg viewBox={`0 0 ${W} ${HH}`} className="lc-svg" style={{ direction: 'ltr' }}>
        <line x1={pad} y1={HH - pad} x2={W - pad} y2={HH - pad} className="lc-axis" />
        {bars.map((b, i) => (
          <g key={i}>
            <rect
              x={pad + i * bw + 1}
              y={HH - pad - b.h * scale}
              width={Math.max(bw - 2, 1)}
              height={b.h * scale}
              className={`lc-bar ${i < fr.done ? 'on' : ''} ${i === fr.done - 1 && !finished ? 'now' : ''}`}
            />
            {bars.length <= 16 && <text x={pad + i * bw + bw / 2} y={HH - 8} textAnchor="middle" className="lc-lbl">{b.label.split('=')[1]}</text>}
          </g>
        ))}
        {pk === 'tri' && <line x1={pad} y1={HH - pad} x2={W - pad} y2={pad} className="lc-diag" />}
      </svg>

      <div className="lc-sum">
        <Tex>{`\\text{work} = ${P.sumTex} = ${P.closed(n)}`}</Tex>
        <span className="tag amber">{finished ? <Tex>{P.theta}</Tex> : '…'}</span>
      </div>

      <div className="tt-side">
        <Pseudocode lines={P.code} active={fr.done > 0 && !finished ? fr.line : null} title="Code" />
        <div className="tt-info">
          <div className="tt-counters">
            <span>تكرارات الحلقة الخارجية: <b className="ltr">{fr.done} / {bars.length}</b></span>
            <span>استدعاءات <code>work()</code> حتى الآن: <b className="ltr">{fr.total}</b></span>
          </div>
          {finished && (
            <div className="tt-verdict v-T">
              المجموع الفعلي <b className="ltr">{fr.total}</b> = الصيغة. {pk === 'tri' && 'المساحة نصف المربع تقريبًا: الخط القطري يقسمه نصفين.'}{pk === 'harm' && 'الأعمدة تتناقص كمنحنى n/x، ومساحته n ln n.'}{pk === 'geo' && 'كل عمود نصف الذي قبله، فالمجموع لا يتجاوز ضعف العمود الأول.'}{pk === 'dbl' && 'عدد مرات المضاعفة حتى نصل إلى n هو log₂ n.'}{pk === 'sq' && 'n عمودًا، طول كل منها n.'}
            </div>
          )}
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

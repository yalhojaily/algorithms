import { useMemo, useState } from 'react';
import { BS_PSEUDO, SORTED, bsFrames, type BsFrame, type BsMode } from '../lib/bsearch';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const MODES: { k: BsMode; label: string }[] = [
  { k: 'find', label: 'البحث عن x' },
  { k: 'lower', label: 'lower bound' },
  { k: 'upper', label: 'upper bound' },
  { k: 'answer', label: 'البحث في الجواب: ⌈√N⌉' },
];

/** Binary search in four forms, with the live range [lo, hi] and the number of comparisons. */
export default function BinarySearchLab() {
  const [mode, setMode] = useState<BsMode>('lower');
  const [x, setX] = useState(21);
  const [N, setN] = useState(150);
  const target = mode === 'answer' ? N : x;
  const frames = useMemo(() => record(bsFrames(mode, SORTED, target)), [mode, target]);
  const s = useStepper<BsFrame>(frames, 1.5);
  const f = s.frame;
  const n = SORTED.length;
  const bound = Math.ceil(Math.log2((mode === 'answer' ? N : n) + 1));
  const isEnd = f.result !== undefined;

  return (
    <div className="widget card bsl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">البحث الثنائي بأشكاله</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {MODES.map((m) => <button key={m.k} className={`pr-tab ${m.k === mode ? 'on' : ''}`} onClick={() => setMode(m.k)}><span dir="ltr">{m.label}</span></button>)}
      </div>
      <div className="ct-size">
        {mode === 'answer'
          ? <label><span className="qg-label">N = <b className="ltr">{N}</b></span><input type="range" min={1} max={1000} value={N} onChange={(e) => setN(+e.target.value)} /></label>
          : <label><span className="qg-label">x = <b className="ltr">{x}</b></span><input type="range" min={0} max={55} value={x} onChange={(e) => setX(+e.target.value)} /></label>}
        <span className="ct-note">المقارنات: <b className="ltr">{f.comps}</b> من حد أقصى <b className="ltr">⌈log₂({mode === 'answer' ? N : n} + 1)⌉ = {bound}</b></span>
      </div>

      {mode !== 'answer' ? (
        <div className="bsl-arr" dir="ltr">
          {SORTED.map((v, i) => {
            const live = mode === 'find' ? i >= f.lo && i <= f.hi : i >= f.lo && i < f.hi;
            const res = isEnd && f.result === i;
            return (
              <div key={i} className={`bsl-cell ${live ? 'live' : ''} ${f.mid === i ? 'mid' : ''} ${res ? 'res' : ''} ${v === x ? 'eq' : ''}`}>
                <span className="bsl-v">{v}</span>
                <span className="bsl-i">{i}</span>
                {i === f.lo && <span className="bsl-tag lo">lo</span>}
                {i === f.hi && <span className="bsl-tag hi">hi</span>}
              </div>
            );
          })}
          {mode !== 'find' && <div className={`bsl-cell end ${f.hi === n ? 'live' : ''} ${isEnd && f.result === n ? 'res' : ''}`}><span className="bsl-v">∞</span><span className="bsl-i">{n}</span>{f.hi === n && <span className="bsl-tag hi">hi</span>}{f.lo === n && <span className="bsl-tag lo">lo</span>}</div>}
        </div>
      ) : (
        <div className="bsl-line" dir="ltr">
          <div className="bsl-track" />
          <div className="bsl-range" style={{ left: `${(f.lo / N) * 100}%`, width: `${(Math.max(f.hi - f.lo, 0) / N) * 100}%` }} />
          {f.mid !== null && <div className="bsl-midpin" style={{ left: `${(f.mid / N) * 100}%` }}><span>{f.mid}</span></div>}
          <span className="bsl-end l">0</span><span className="bsl-end r">{N}</span>
        </div>
      )}
      {mode !== 'find' && mode !== 'answer' && <div className="vm-help" style={{ textAlign: 'center' }}>hi = <b className="ltr">{f.hi}</b> (الخانة ∞ وهمية: «بعد آخر عنصر»)</div>}

      <div className="tt-side">
        <Pseudocode lines={BS_PSEUDO[mode]} active={f.line} />
        <div className="tt-info"><div className={`inv-banner ${isEnd ? 'sq-ok' : 'on'}`}>{f.note}</div></div>
      </div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { H_PSEUDO, heapFrames, type HFrame, type HeapOp } from '../lib/heap';
import { mulberry32 } from '../lib/montecarlo';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const MAX = 15;
const START = [50, 30, 45, 12, 25, 40, 8, 5, 10];
const OP_LABEL: Record<HeapOp, string> = { insert: 'INSERT', extract: 'EXTRACT-MAX', build: 'BUILD-HEAP', sort: 'HEAPSORT' };

/** A max-heap shown as a tree and as the array it really is, with insert, extract-max, build-heap and heapsort. */
export default function HeapLab() {
  const [run, setRun] = useState<{ op: HeapOp; frames: HFrame[] }>(() => ({ op: 'build', frames: record(heapFrames(START, 'build')) }));
  const [x, setX] = useState(42);
  const [seed, setSeed] = useState(1);
  const s = useStepper<HFrame>(run.frames, 2.5);
  const f = s.frame;
  const final = run.frames[run.frames.length - 1];
  const sortedState = run.op === 'sort';
  const size = final.arr.length;

  const start = (op: HeapOp, base: number[], val = 0) => setRun({ op, frames: record(heapFrames(base, op, val)) });
  const randomArr = () => {
    const r = mulberry32(seed * 7 + 3);
    setSeed(seed + 1);
    return Array.from({ length: 12 }, () => 1 + Math.floor(r() * 99));
  };

  const W = 520, LH = 62, R = 17;
  const pos = (i: number) => {
    const d = Math.floor(Math.log2(i + 1));
    const k = i - (2 ** d - 1);
    return { x: ((k + 0.5) / 2 ** d) * W, y: 24 + d * LH };
  };
  const levels = f.arr.length ? Math.floor(Math.log2(f.arr.length)) + 1 : 1;
  const H = 24 + (levels - 1) * LH + 30;
  const state = (i: number) => (f.hl.includes(i) ? 'hl' : f.moved.includes(i) ? 'mv' : i >= f.n ? 'out' : '');

  return (
    <div className="widget card hp">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الكومة: شجرة تعيش في مصفوفة</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <label className="hp-in"><span className="qg-label">x =</span><input type="number" min={1} max={99} value={x} onChange={(e) => setX(Math.max(1, Math.min(99, +e.target.value || 1)))} dir="ltr" /></label>
        <button className="btn btn-sm" disabled={sortedState || size >= MAX} onClick={() => { start('insert', final.arr, x); setX(1 + Math.floor(Math.random() * 99)); }}>INSERT(x)</button>
        <button className="btn btn-sm" disabled={sortedState || size === 0} onClick={() => start('extract', final.arr)}>EXTRACT-MAX</button>
        <button className="btn btn-sm" onClick={() => start('build', randomArr())}>BUILD-HEAP لمصفوفة عشوائية</button>
        <button className="btn btn-sm" disabled={sortedState || size < 2} onClick={() => start('sort', final.arr)}>HEAPSORT</button>
      </div>
      {sortedState && <div className="vm-help">المصفوفة الآن مرتبة، لا كومة. ابنِ كومة جديدة لتكمل.</div>}

      <svg className="hp-svg" viewBox={`0 0 ${W} ${H}`} direction="ltr">
        {f.arr.map((_, i) => {
          if (i === 0) return null;
          const a = pos((i - 1) >> 1), b = pos(i);
          return <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`hp-edge ${i >= f.n ? 'out' : ''}`} />;
        })}
        {f.arr.map((v, i) => {
          const p = pos(i);
          return (
            <g key={i} className={`hp-node ${state(i)}`}>
              <circle cx={p.x} cy={p.y} r={R} />
              <text x={p.x} y={p.y + 4} textAnchor="middle">{v}</text>
              <text x={p.x} y={p.y + R + 11} textAnchor="middle" className="hp-idx">{i}</text>
            </g>
          );
        })}
      </svg>

      <div className="hp-arr" dir="ltr">
        {f.arr.map((v, i) => <span key={i} className={`hp-cell ${state(i)}`}>{v}<em>{i}</em></span>)}
        {Array.from({ length: Math.max(0, MAX - f.arr.length) }, (_, k) => <span key={`x${k}`} className="hp-cell empty"><em>{f.arr.length + k}</em></span>)}
      </div>

      <div className="da-stats">
        <span>العملية: <bdi dir="ltr" className="ltr">{OP_LABEL[run.op]}</bdi></span>
        <span>المقارنات: <b className="ltr">{f.comps}</b></span>
        <span>التبديلات: <b className="ltr">{f.swaps}</b></span>
        <span>الحجم: <b className="ltr">{f.n}</b></span>
      </div>
      <div className="gc-legend">
        <span className="gc-key ar"><i className="hp-sw hl" /> يُقارن الآن</span>
        <span className="gc-key ar"><i className="hp-sw mv" /> بُدّل للتو</span>
        <span className="gc-key ar"><i className="hp-sw out" /> خارج الكومة (الجزء المرتب)</span>
      </div>

      <div className="tt-side">
        <Pseudocode lines={H_PSEUDO[run.op]} active={f.line} />
        <div className="tt-info"><div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}>{f.note}</div></div>
      </div>
      <Player s={s} />
    </div>
  );
}

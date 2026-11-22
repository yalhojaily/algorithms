import { useMemo, useState } from 'react';
import { subsetTable } from '../lib/dp';
import DPGrid from './DPGrid';
import { Player, useStepper } from '../engine/stepper';

const PRESETS: { X: number[]; T: number }[] = [
  { X: [8, 6, 7, 5, 3, 10, 9], T: 15 },
  { X: [11, 6, 5, 1, 7, 13, 12], T: 15 },
  { X: [3, 5, 7], T: 12 },
];

/** FastSubsetSum: rows from the bottom (i = n+1) up, each row left to right; then one subset read back. */
export default function SubsetTableLab() {
  const [p, setP] = useState(0);
  const { X, T } = PRESETS[p];
  const n = X.length;
  const { S, recover } = useMemo(() => subsetTable(X, T), [p]);
  const sub = useMemo(() => recover(), [p]);
  // frames: rows n+1 down to 1, each with T+1 cells
  const total = (n + 1) * (T + 1);
  const s = useStepper<number>(useMemo(() => Array.from({ length: total + 1 }, (_, k) => k), [p]), 16);
  const k = s.frame, done = k >= total;
  const rowOfStep = (step: number) => n + 1 - Math.floor(step / (T + 1));
  const ci = rowOfStep(Math.min(k, total - 1)), ct = Math.min(k, total - 1) % (T + 1);
  const filled = (i: number, t: number) => done || (n + 1 - i) * (T + 1) + t < k;
  const pathCells = new Set<string>();
  if (done && sub) { let t = T; for (let i = 1; i <= n + 1; i++) { pathCells.add(`${i},${t}`); if (sub.includes(i)) t -= X[i - 1]; } }
  return (
    <div className="widget card sbt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول <bdi dir="ltr">S[i, t]</bdi>: صفًا صفًا من الأسفل</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((q, i) => <button key={i} className={`tt-preset ${i === p ? 'on' : ''}`} onClick={() => setP(i)}><bdi dir="ltr">X = {`{${q.X.join(', ')}}`}, T = {q.T}</bdi></button>)}
      </div>
      <DPGrid
        compact
        rows={Array.from({ length: n + 1 }, (_, r) => (r < n ? <>i={r + 1}<small> ({X[r]})</small></> : <>i={n + 1}</>))}
        cols={Array.from({ length: T + 1 }, (_, t) => t)}
        corner="t →"
        cell={(r, t) => {
          const i = r + 1, on = filled(i, t);
          const cur = !done && i === ci && t === ct;
          const reads = !done && i === ci + 1 && (t === ct || (ci <= n && t === ct - X[ci - 1]));
          return { text: on ? (S[i][t] ? 'T' : '·') : '', cls: `${on ? (S[i][t] ? 't' : 'f') : 'empty'} ${cur ? 'cur' : ''} ${reads ? 'dep' : ''} ${pathCells.has(`${i},${t}`) ? 'path' : ''}` };
        }}
      />
      <div className="edl-msg">
        {done ? (sub ? <>الجواب True، ومجموعة من الجدول نفسه: <bdi dir="ltr">{`{${sub.map((i) => X[i - 1]).join(', ')}}`}</bdi>. نمشي من <bdi dir="ltr">S[1, T]</bdi> إلى الأسفل: إن كان <bdi dir="ltr">S[i+1, t]</bdi> False فلا بد أننا أخذنا <bdi dir="ltr">X[i]</bdi>.</> : 'الجواب False: لا مجموعة جزئية مجموعها T.')
          : ci === n + 1 ? <>الأساس: <bdi dir="ltr">S[{n + 1}, t]</bdi> صحيح فقط حين <bdi dir="ltr">t = 0</bdi>.</>
          : <><bdi dir="ltr">S[{ci}, {ct}] = S[{ci + 1}, {ct}]{ct >= X[ci - 1] ? ` ∨ S[${ci + 1}, ${ct - X[ci - 1]}]` : ''}</bdi>{ct < X[ci - 1] && ct > 0 ? '  (لا يمكن أخذ X[i]: أكبر من t)' : ''}</>}
      </div>
      <div className="da-stats">
        <span>الخانات: <bdi dir="ltr">(n+1)(T+1) = {total}</bdi></span>
        <span>والتراجع في أسوأ الحالات: <bdi dir="ltr">2<sup>n+1</sup> − 1 = {2 ** (n + 1) - 1}</bdi> استدعاء</span>
      </div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { SORTS, makeArr, type InputKind, type SFrame } from '../lib/sortrace';
import { Player, record, useStepper } from '../engine/stepper';

const KINDS: { k: InputKind; label: string }[] = [
  { k: 'random', label: 'عشوائية' },
  { k: 'nearly', label: 'شبه مرتبة' },
  { k: 'sorted', label: 'مرتبة' },
  { k: 'reversed', label: 'معكوسة' },
  { k: 'few', label: 'قيم مكررة' },
];

/** Insertion, selection and bubble sort racing on the same input, with comparison and write counters. */
export default function SortRace() {
  const [kind, setKind] = useState<InputKind>('random');
  const [n, setN] = useState(16);
  const [seed, setSeed] = useState(4);
  const A = useMemo(() => makeArr(kind, n, seed), [kind, n, seed]);
  const runs = useMemo(() => SORTS.map((s) => record(s.run(A))), [A]);
  const L = Math.max(...runs.map((r) => r.length));
  const ticks = useMemo(() => Array.from({ length: L }, (_, i) => i), [L]);
  const s = useStepper<number>(ticks, 6);
  const maxV = Math.max(...A);
  const frames: SFrame[] = runs.map((r) => r[Math.min(s.i, r.length - 1)]);
  const finals = runs.map((r) => r[r.length - 1]);

  return (
    <div className="widget card sr">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">سباق: الإدراج والاختيار والفقاعة على المدخل نفسه</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {KINDS.map((x) => <button key={x.k} className={`tt-preset ${x.k === kind ? 'on' : ''}`} onClick={() => setKind(x.k)}>{x.label}</button>)}
        <span className="qg-label">n =</span>
        {[12, 24].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        <button className="tt-preset" onClick={() => setSeed(seed + 1)}>🎲</button>
      </div>
      <div className="sr-grid">
        {SORTS.map((alg, k) => {
          const f = frames[k];
          const fin = s.i >= runs[k].length - 1;
          return (
            <div key={alg.key} className={`sr-lane ${fin ? 'fin' : ''}`}>
              <div className="sr-head"><b>{alg.label}</b>{fin && <span className="sr-done">✓ انتهى</span>}</div>
              <div className="sr-bars" dir="ltr">
                {f.arr.map((v, i) => (
                  <i key={i} className={`${f.cmp.includes(i) ? 'cmp' : ''} ${f.done.includes(i) || f.finished ? 'ok' : ''}`} style={{ height: `${(v / maxV) * 100}%` }} />
                ))}
              </div>
              <div className="sr-stats">
                <span>مقارنات <b className="ltr">{f.comps}</b> <em className="ltr">/ {finals[k].comps}</em></span>
                <span>كتابات <b className="ltr">{f.writes}</b> <em className="ltr">/ {finals[k].writes}</em></span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="vm-help">الأخضر: الجزء الذي استقر. الأحمر: العنصران اللذان يُقارنان الآن. والرقم بعد «/» هو المجموع النهائي لكل خوارزمية على هذا المدخل.</div>
      <Player s={s} />
    </div>
  );
}

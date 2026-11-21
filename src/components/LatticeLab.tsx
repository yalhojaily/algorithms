import { useMemo, useState } from 'react';
import { digitsLE, latticeFrames, type LFrame } from '../lib/lattice';
import { Player, useStepper } from '../engine/stepper';

const PRESETS: [number, number][] = [[934, 314], [123, 456], [99, 99], [1234, 5678]];

/** Fibonacci's lattice multiplication: all m·n partial products, summed one diagonal (power of ten) at a time. */
export default function LatticeLab() {
  const [[x, y], setXY] = useState<[number, number]>([934, 314]);
  const frames = useMemo(() => latticeFrames(x, y), [x, y]);
  const s = useStepper<LFrame>(frames, 1.2);
  const f = s.frame;
  const X = digitsLE(x), Y = digitsLE(y), m = X.length, n = Y.length;
  const set = (i: 0 | 1, v: string) => {
    const k = Math.max(0, Math.min(9999, Math.floor(+v || 0)));
    setXY(i === 0 ? [k, y] : [x, k]);
  };
  const state = (i: number, j: number) => (f.k < 0 ? '' : i + j === f.k ? 'cur' : i + j < f.k ? 'done' : '');
  return (
    <div className="widget card lt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ضرب الشبكة: قطر بعد قطر</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map(([a, b]) => (
          <button key={`${a}x${b}`} className={`tt-preset ${a === x && b === y ? 'on' : ''}`} onClick={() => setXY([a, b])}>
            <bdi dir="ltr">{a} × {b}</bdi>
          </button>
        ))}
        <span className="lt-in" dir="ltr">
          <input type="number" min={0} max={9999} value={x} onChange={(e) => set(0, e.target.value)} aria-label="x" />
          ×
          <input type="number" min={0} max={9999} value={y} onChange={(e) => set(1, e.target.value)} aria-label="y" />
        </span>
      </div>
      <div className="lt-body">
        <table className="lt-grid" dir="ltr">
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: n }, (_, c) => n - 1 - c).map((j) => <th key={j}>{Y[j]}<small>j={j}</small></th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: m }, (_, r) => m - 1 - r).map((i) => (
              <tr key={i}>
                <th>{X[i]}<small>i={i}</small></th>
                {Array.from({ length: n }, (_, c) => n - 1 - c).map((j) => (
                  <td key={j} className={state(i, j)}>
                    <span>{X[i] * Y[j]}</span>
                    <small>10<sup>{i + j}</sup></small>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="lt-side">
          {f.k < 0 ? (
            <p className="lt-note">كل خانة في الشبكة ضرب رقم في رقم: <bdi dir="ltr">X[i] · Y[j]</bdi>، ووزنه <bdi dir="ltr">10<sup>i+j</sup></bdi>. الخانات ذات الوزن نفسه تقع على قطر واحد. اضغط ▶.</p>
          ) : (
            <>
              <div className="lt-step">العمود <bdi dir="ltr">k = {f.k}</bdi>: الخانات التي <bdi dir="ltr">i + j = {f.k}</bdi></div>
              <div className="lt-sum" dir="ltr">
                hold = {f.holdBefore}{f.cells.map(([i, j]) => ` + ${X[i]}·${Y[j]}`).join('')} = <b>{f.sum}</b>
              </div>
              <div className="lt-sum" dir="ltr">Z[{f.k}] = {f.sum} mod 10 = <b>{f.sum % 10}</b> · hold ← ⌊{f.sum}/10⌋ = <b>{f.carry}</b></div>
            </>
          )}
          <div className="lt-z" dir="ltr">
            <span className="lt-zl">Z =</span>
            {[...f.Z].reverse().map((d, r) => {
              const k = f.Z.length - 1 - r;
              return <span key={k} className={`${d === null ? 'empty' : ''} ${k === f.k ? 'cur' : ''}`}>{d ?? '·'}</span>;
            })}
          </div>
        </div>
      </div>
      <div className="da-stats">
        <span>ضروب رقم في رقم: <b className="ltr">{f.mults}</b> من <bdi dir="ltr">m · n = {m} · {n} = {m * n}</bdi></span>
        {f.k === m + n - 1 && <span>الناتج: <b className="ltr">{(x * y).toLocaleString('en')}</b></span>}
      </div>
      <div className="vm-help">هذا ترتيب Fibonacci: من الأقل أهمية إلى الأكثر. والطريقة المدرسية تحسب الخانات نفسها صفًا صفًا. الترتيب يختلف، لكن عدد ضروب الأرقام هو نفسه دائمًا: <bdi dir="ltr">m · n</bdi>.</div>
      <Player s={s} />
    </div>
  );
}

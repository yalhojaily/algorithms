import { useMemo, useState } from 'react';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const PSEUDO = [
  'POWER-SET(S = [s₀, …, sₙ₋₁]):',
  '  result ← [ ]',
  '  for mask ← 0 to 2ⁿ − 1:',
  '    T ← { sⱼ : bit j of mask is 1 }',
  '    append T to result',
  '  return result          // 2ⁿ subsets',
];

const POOL = ['a', 'b', 'c', 'd', 'e'];

interface Frame { line: number; mask: number; found: number[]; note: string }

function* run(n: number): Generator<Frame> {
  const found: number[] = [];
  yield { line: 2, mask: -1, found: [], note: `n = ${n}، فعدد المجموعات الجزئية 2^${n} = ${2 ** n}.` };
  for (let mask = 0; mask < 2 ** n; mask++) {
    yield { line: 3, mask, found: [...found], note: `mask = ${mask} = ${mask.toString(2).padStart(n, '0')} بالنظام الثنائي` };
    found.push(mask);
    yield { line: 5, mask, found: [...found], note: `أضفنا المجموعة الجزئية رقم ${found.length}` };
  }
  yield { line: 6, mask: -1, found: [...found], note: `انتهى: ${found.length} مجموعة جزئية.` };
}

const subsetOf = (mask: number, n: number) => POOL.slice(0, n).filter((_, j) => (mask >> j) & 1);
const showSubset = (xs: string[]) => (xs.length ? `{${xs.join(', ')}}` : '∅');

/** Counting from 0 to 2ⁿ − 1 in binary lists every subset exactly once: bit j says whether element j is in. */
export default function PowerSetStepper() {
  const [n, setN] = useState(3);
  const frames = useMemo(() => record(run(n)), [n]);
  const s = useStepper(frames, 3);
  const fr = s.frame;

  return (
    <div className="widget card ps">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">المجموعة الأسية بالعدّ الثنائي</span>
      </div>
      <div className="ps-n">
        <span className="qg-label">عدد العناصر n:</span>
        {[2, 3, 4, 5].map((k) => <button key={k} className={`tt-preset ${k === n ? 'on' : ''}`} onClick={() => setN(k)}>{k}</button>)}
        <span className="ltr ps-S">S = {showSubset(POOL.slice(0, n))}</span>
      </div>

      <div className="ps-bits" dir="ltr">
        {fr.mask >= 0 ? (
          <>
            {Array.from({ length: n }, (_, k) => n - 1 - k).map((j) => {
              const on = (fr.mask >> j) & 1;
              return (
                <div key={j} className={`ps-bit ${on ? 'on' : ''}`}>
                  <span className="ps-b">{on}</span>
                  <span className="ps-el">{POOL[j]}</span>
                  <span className="ps-j">bit {j}</span>
                </div>
              );
            })}
            <div className="ps-eq">→ <b>{showSubset(subsetOf(fr.mask, n))}</b></div>
          </>
        ) : fr.found.length ? (
          <div className="ps-wait">كل الأقنعة من <span className="ltr">0</span> إلى <span className="ltr">{2 ** n - 1}</span> مرّت: <b className="ltr">{fr.found.length}</b> مجموعة جزئية، كل منها مرة واحدة بالضبط.</div>
        ) : <div className="ps-wait">اضغط «تشغيل»</div>}
      </div>

      <div className="tt-side">
        <Pseudocode lines={PSEUDO} active={fr.line} />
        <div className="tt-info">
          <div className="tt-note" aria-live="polite"><span dir="auto">{fr.note}</span></div>
          <div className="ps-list" dir="ltr">
            {fr.found.map((mk) => (
              <span key={mk} className={`ps-item ${mk === fr.mask ? 'now' : ''}`}>{showSubset(subsetOf(mk, n))}</span>
            ))}
          </div>
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

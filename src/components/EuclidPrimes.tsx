import { useMemo, useState } from 'react';
import { euclid, EUCLID_PSEUDO, type EuclidFrame } from '../lib/euclid';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

const PRESETS: { label: string; list: number[] }[] = [
  { label: 'أول 6 أعداد أولية', list: [2, 3, 5, 7, 11, 13] },
  { label: '{3, 5}', list: [3, 5] },
  { label: 'أول 4', list: [2, 3, 5, 7] },
  { label: 'أول 11', list: PRIMES.slice(0, 11) },
];

/** Euclid's proof as an algorithm: pick any finite list of primes and watch it produce a prime that is not on it. */
export default function EuclidPrimes() {
  const [list, setList] = useState<number[]>([2, 3, 5, 7, 11, 13]);
  const sorted = useMemo(() => [...list].sort((a, b) => a - b), [list]);
  const frames = useMemo(() => (sorted.length ? record(euclid(sorted)) : []), [sorted]);
  const s = useStepper<EuclidFrame>(frames.length ? frames : [{ line: 1, product: 1n, used: 0, tries: 0, note: 'اختر عددًا أوليًا واحدًا على الأقل.' }], 2);
  const fr = s.frame;

  const toggle = (p: number) => setList((L) => (L.includes(p) ? L.filter((x) => x !== p) : [...L, p]));
  const done = fr.line === 6;

  return (
    <div className="widget card eu">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">برهان إقليدس كخوارزمية: أعطني قائمة أعداد أولية، أعطك عددًا أوليًا ليس فيها</span>
      </div>

      <div className="qg-label">اختر القائمة «الكاملة» المزعومة:</div>
      <div className="eu-chips" dir="ltr">
        {PRIMES.map((p) => (
          <button key={p} className={`eu-chip ${list.includes(p) ? 'on' : ''} ${done && fr.factor === BigInt(p) ? 'found' : ''}`} onClick={() => toggle(p)}>{p}</button>
        ))}
      </div>
      <div className="tt-presets">
        {PRESETS.map((pr) => (
          <button key={pr.label} className="tt-preset" onClick={() => setList(pr.list)}>{pr.label}</button>
        ))}
      </div>

      <div className="eu-board" dir="ltr">
        <div className="eu-row">
          <span className="eu-k">P =</span>
          <span className="eu-v">
            {sorted.map((p, k) => (
              <span key={p} className={k < fr.used ? 'in' : 'out'}>{k > 0 && <i> · </i>}{p}</span>
            ))}
            {fr.used > 0 && <b> = {fr.product.toString()}</b>}
          </span>
        </div>
        <div className={`eu-row ${fr.N ? '' : 'dim'}`}>
          <span className="eu-k">N =</span>
          <span className="eu-v">P + 1 {fr.N && <b>= {fr.N.toString()}</b>}</span>
        </div>
        <div className={`eu-row ${fr.d ? '' : 'dim'}`}>
          <span className="eu-k">N mod d</span>
          <span className="eu-v">
            {fr.d !== undefined ? <>{fr.N!.toString()} mod {fr.d.toString()} = <b className={fr.rem === 0n ? 'zero' : ''}>{fr.rem!.toString()}</b></> : '—'}
          </span>
        </div>
        {fr.factor && (
          <div className="eu-row eu-found">
            <span className="eu-k">p<sub>new</sub> =</span>
            <span className="eu-v"><b>{fr.factor.toString()}</b> {fr.factor === fr.N ? '(N itself is prime)' : `(N = ${fr.factor} × ${(fr.N! / fr.factor).toString()})`}</span>
          </div>
        )}
      </div>

      <div className="tt-side">
        <Pseudocode lines={EUCLID_PSEUDO} active={fr.line} />
        <div className="tt-info">
          <div className="tt-note" aria-live="polite"><span dir="auto">{fr.note}</span></div>
          <div className="tt-counters"><span>عدد عمليات القسمة: <b className="ltr">{fr.tries.toLocaleString('en')}</b></span></div>
          {done && (
            <div className="tt-verdict v-T">
              <strong>القائمة لم تكن كاملة.</strong> العدد <span className="ltr">{fr.factor!.toString()}</span> أولي، ويقسم N. ولا يقسم N أيُّ عدد في القائمة، فكلها تترك الباقي 1. فهو عدد أولي جديد.
            </div>
          )}
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { enumerate, ENUM_PSEUDO, expected, type EnumFrame, type Mode } from '../lib/enumerate';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';
import { Tex } from './MathText';

const MODES: { key: Mode; label: string; formula: (n: number, k: number) => string }[] = [
  { key: 'perm', label: 'ترتيب (الترتيب مهم)', formula: (n, k) => `P(${n}, ${k}) = \\frac{${n}!}{${n - k}!}` },
  { key: 'comb', label: 'اختيار (الترتيب لا يهم)', formula: (n, k) => `\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!}` },
  { key: 'multi', label: 'اختيار مع التكرار', formula: (n, k) => `\\binom{${n} + ${k} - 1}{${k}}` },
];

/** One recursive algorithm, three small changes: arrangements, subsets, multisets. Watch the choices being made. */
export default function EnumStepper() {
  const [mode, setMode] = useState<Mode>('comb');
  const [n, setN] = useState(4);
  const [k, setK] = useState(2);
  const kk = Math.min(k, mode === 'multi' ? 4 : n);
  const frames = useMemo(() => record(enumerate(mode, n, kk)), [mode, n, kk]);
  const s = useStepper<EnumFrame>(frames, 4);
  const fr = s.frame;
  const M = MODES.find((m) => m.key === mode)!;
  const total = expected(mode, n, kk);

  return (
    <div className="widget card enum-w">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">خوارزمية واحدة تولّد التباديل والتوافيق</span>
      </div>
      <div className="rel-tabs">
        {MODES.map((m) => <button key={m.key} className={`pr-tab ${m.key === mode ? 'on' : ''}`} onClick={() => setMode(m.key)}>{m.label}</button>)}
      </div>
      <div className="ps-n">
        <span className="qg-label">n =</span>
        {[2, 3, 4, 5].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        <span className="qg-label">k =</span>
        {[1, 2, 3, 4].filter((v) => mode === 'multi' || v <= n).map((v) => <button key={v} className={`tt-preset ${v === kk ? 'on' : ''}`} onClick={() => setK(v)}>{v}</button>)}
      </div>

      <div className="en-slots" dir="ltr" style={{ direction: "ltr" }}>
        {Array.from({ length: kk }, (_, i) => (
          <div key={i} className={`en-slot ${i < fr.prefix.length ? 'on' : ''} ${i === fr.prefix.length - 1 && fr.line === 5 ? 'now' : ''}`}>
            <span>{fr.prefix[i] ?? ''}</span>
            <i>موضع {i + 1}</i>
          </div>
        ))}
        <div className="en-formula"><Tex>{`${M.formula(n, kk)} = ${total}`}</Tex></div>
      </div>

      <div className="tt-side">
        <Pseudocode lines={ENUM_PSEUDO[mode]} active={fr.line} />
        <div className="tt-info">
          <div className="tt-note" aria-live="polite"><span dir="auto">{fr.note}</span></div>
          <div className="tt-counters">
            <span>النتائج: <b className="ltr">{fr.out.length} / {total}</b></span>
            <span>الاستدعاءات: <b className="ltr">{fr.calls}</b></span>
          </div>
          <div className="ps-list" dir="ltr">
            {fr.out.map((o, i) => (
              <span key={i} className={`ps-item ${i === fr.out.length - 1 && fr.line === 2 ? 'now' : ''}`}>
                {mode === 'perm' ? `(${o.join(', ')})` : `{${o.join(', ')}}`}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

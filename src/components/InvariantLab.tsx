import { useMemo, useState } from 'react';
import { INV_PROGRAMS, type InvFrame } from '../lib/invariants';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';
import { MathText } from './MathText';

/** Step through a loop and watch which candidate invariants survive every loop-head check. */
export default function InvariantLab() {
  const [pk, setPk] = useState('sum');
  const [seed, setSeed] = useState(7);
  const [open, setOpen] = useState<string | null>(null);
  const P = INV_PROGRAMS.find((p) => p.key === pk)!;
  const inp = useMemo(() => P.make(seed), [P, seed]);
  const frames = useMemo(() => record(P.run(inp)), [P, inp]);
  const s = useStepper<InvFrame>(frames, 2);
  const fr = s.frame;

  // For each candidate: its value at every frame (null where the frame is not a check).
  const table = useMemo(() => P.candidates.map((c) => frames.map((f) => (f.check ? c.check(f, inp) : null))), [P, frames, inp]);
  const checksSoFar = frames.slice(0, s.i + 1).filter((f) => f.check).length;
  const totalChecks = frames.filter((f) => f.check).length;

  const pick = (k: string) => { setPk(k); setOpen(null); };
  const inputText = inp.arr.length ? '' : Object.entries(inp.vars).map(([k, v]) => `${k}₀ = ${v}`).join('،  ');

  return (
    <div className="widget card inv">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ثابت الحلقة: أي العبارات تصمد في كل فحص؟</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {INV_PROGRAMS.map((p) => <button key={p.key} className={`pr-tab ${p.key === pk ? 'on' : ''}`} onClick={() => pick(p.key)}>{p.label}</button>)}
      </div>
      <div className="ps-n">
        <button className="tt-preset" onClick={() => setSeed(seed + 1)}>🎲 مدخل آخر</button>
        {seed !== 7 && <button className="tt-preset" onClick={() => setSeed(7)}>المدخل الأصلي</button>}
        {pk === 'bs' && <span className="qg-label">{inp.arr.includes(inp.vars.x) ? 'x موجود في A' : 'x غير موجود في A'}</span>}
        {inputText && <span className="qg-label ltr">{inputText}</span>}
      </div>

      {fr.arr.length > 0 && (
        <div className="ram-mem" dir="ltr">
          <div className="ram-label">A</div>
          <div className="ram-cells">
            {fr.arr.map((v, k) => {
              const inR = fr.range && k >= fr.range[0] && k <= fr.range[1];
              return (
                <div key={k} className={`ram-cell ${inR ? 'inv-in' : ''} ${fr.ptr?.includes(k) ? 'pi' : ''} ${pk === 'bs' && v === fr.vars.x ? 'inv-x' : ''}`}>
                  <span className="ram-v">{v}</span>
                  <span className="ram-addr">{k}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="tt-side">
        <Pseudocode lines={P.pseudo} active={fr.line} />
        <div className="tt-info">
          <div className="ram-vars" dir="ltr">
            {Object.entries(fr.vars).map(([k, v]) => <span key={k}><i>{k}</i> = <b>{v}</b></span>)}
          </div>
          <div className={`inv-banner ${fr.check ? 'on' : ''}`}>
            {fr.check
              ? <>فحص الحلقة رقم <b className="ltr">{checksSoFar}</b> من <b className="ltr">{totalChecks}</b>: هنا يجب أن يصح الثابت.</>
              : fr.done ? <>انتهت الخوارزمية: <b className="ltr">{fr.done}</b></> : checksSoFar === 0 ? <>قبل الحلقة: تهيئة المتغيرات. الفحص الأول سيختبر <b>التهيئة</b>.</> : <>داخل الحلقة: الثابت قد يُكسر مؤقتًا، المهم أن يعود قبل الفحص التالي.</>}
          </div>
          <div className="inv-post"><span>المطلوب عند النهاية:</span> <span className="ltr">{P.post}</span></div>
        </div>
      </div>

      <div className="inv-cands">
        {P.candidates.map((c, ci) => {
          const vals = table[ci];
          const seen = vals.slice(0, s.i + 1).filter((v) => v !== null) as boolean[];
          const firstFail = vals.findIndex((v) => v === false);
          const failed = firstFail >= 0 && firstFail <= s.i;
          const now = vals[s.i];
          const allTrue = vals.every((v) => v !== false);
          const verdict = !s.atEnd ? (failed ? 'bad' : 'wait') : !allTrue ? 'bad' : c.strong ? 'good' : 'weak';
          const label = { wait: '؟', bad: 'ليس ثابتًا', weak: 'ثابت، لكنه لا يكفي', good: 'ثابت، ويثبت الصحة' }[verdict];
          return (
            <div key={c.id} className={`inv-row v-${verdict}`}>
              <button className="inv-row-head" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
                <span className={`inv-now ${now === null ? '' : now ? 'ok' : 'no'}`}>{now === null ? '·' : now ? '✓' : '✗'}</span>
                <MathText className="inv-tex">{c.tex}</MathText>
                <span className="inv-badge">{label}</span>
              </button>
              <div className="inv-marks">
                {seen.map((v, k) => <span key={k} className={v ? 'ok' : 'no'} title={`فحص ${k + 1}`}>{v ? '✓' : '✗'}</span>)}
              </div>
              {(open === c.id || (s.atEnd && verdict !== 'good')) && (s.atEnd || failed) && (
                <MathText as="div" className="inv-note">{c.note}</MathText>
              )}
            </div>
          );
        })}
      </div>
      <Player s={s} />
    </div>
  );
}

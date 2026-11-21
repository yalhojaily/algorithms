import { useMemo, useState } from 'react';
import { bracketFrames, cqDequeue, cqEnqueue, cqNew, postfixFrames, type BrFrame, type CQState, type PfFrame } from '../lib/stackqueue';
import { Player, record, useStepper } from '../engine/stepper';

type Tab = 'queue' | 'brackets' | 'postfix';
const BR = ['{[()()]}', 'a*(b+c)-{d/[e]}', '([)]', '(()', '())('];
const PF = ['3 4 + 2 * 7 -', '5 1 2 + 4 * + 3 -', '2 3 4 * +', '1 +'];

function CircularQueue() {
  const [q, setQ] = useState<CQState>(cqNew());
  const [x, setX] = useState(1);
  const cap = q.a.length;
  const R = cap <= 8 ? 92 : cap <= 16 ? 118 : 140, C = 160;
  const tail = (q.head + q.n) % cap;
  const pos = (k: number, r = R) => { const t = (2 * Math.PI * k) / cap - Math.PI / 2; return [C + r * Math.cos(t), C + r * Math.sin(t)]; };
  const cell = Math.min(40, (2 * Math.PI * R) / cap - 6);
  return (
    <>
      <div className="ps-n">
        <button className="btn btn-sm" onClick={() => { setQ(cqEnqueue(q, x)); setX(x + 1); }}><span dir="ltr">enqueue({x})</span></button>
        <button className="btn btn-sm" onClick={() => setQ(cqDequeue(q))} disabled={q.n === 0}><span dir="ltr">dequeue()</span></button>
        <button className="btn btn-sm" onClick={() => { let s = q, v = x; for (let i = 0; i < 3; i++) { s = cqEnqueue(cqDequeue(s), v++); } setQ(s); setX(v); }}>دوّر ×3</button>
        <button className="btn btn-sm" onClick={() => { setQ(cqNew()); setX(1); }}>↺</button>
      </div>
      <div className="sq-ring" dir="ltr">
        <svg viewBox="0 0 320 320" style={{ maxWidth: 320 }}>
          <circle cx={C} cy={C} r={R} className="sq-track" />
          {q.a.map((v, k) => {
            const [px, py] = pos(k);
            const live = ((k - q.head + cap) % cap) < q.n;
            return (
              <g key={k}>
                <rect x={px - cell / 2} y={py - cell / 2} width={cell} height={cell} rx={6} className={`sq-cell ${live ? 'live' : ''}`} />
                <text x={px} y={py + 5} textAnchor="middle" className="sq-v">{v ?? ''}</text>
                <text x={pos(k, R - cell / 2 - 14)[0]} y={pos(k, R - cell / 2 - 14)[1] + 4} textAnchor="middle" className="sq-i">{k}</text>
              </g>
            );
          })}
          <text x={pos(q.head, R + cell / 2 + 16)[0]} y={pos(q.head, R + cell / 2 + 16)[1] + 4} textAnchor="middle" className="sq-tag head">head</text>
          {q.n < cap && <text x={pos(tail, R + cell / 2 + 16)[0]} y={pos(tail, R + cell / 2 + 16)[1] + 16} textAnchor="middle" className="sq-tag tail">tail</text>}
          <text x={C} y={C - 6} textAnchor="middle" className="sq-mid">n = {q.n}</text>
          <text x={C} y={C + 14} textAnchor="middle" className="sq-mid">cap = {cap}</text>
        </svg>
      </div>
      <div className="inv-banner on">{q.last ?? 'أضف عناصر، ثم احذف بعضها، ثم أضف من جديد: لاحظ كيف يلتف tail إلى أول المصفوفة بدل أن يزيح العناصر.'}{q.code && <code className="sq-code" dir="ltr">{q.code}</code>}</div>
      <div className="vm-help">العناصر المنسوخة في كل التكبيرات حتى الآن: <b className="ltr">{q.copies}</b>. كل عملية تعمل في موضع واحد، إلا التكبير والتصغير.</div>
    </>
  );
}

function Brackets() {
  const [s, setS] = useState(BR[0]);
  const frames = useMemo(() => record(bracketFrames(s)), [s]);
  const st = useStepper<BrFrame>(frames, 1.5);
  const f = st.frame;
  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {BR.map((b) => <button key={b} className={`tt-preset ${b === s ? 'on' : ''}`} onClick={() => setS(b)}><span dir="ltr">{b}</span></button>)}
      </div>
      <div className="sq-text" dir="ltr">{s.split('').map((c, i) => <span key={i} className={i === f.i ? (f.bad ? 'bad' : 'on') : i < f.i ? 'past' : ''}>{c}</span>)}</div>
      <div className="sq-stack-wrap"><StackView items={f.stack} /></div>
      <div className={`inv-banner ${f.bad ? 'sq-bad' : f.ok ? 'sq-ok' : 'on'}`}>{f.note}</div>
      <Player s={st} />
    </>
  );
}

function Postfix() {
  const [e, setE] = useState(PF[0]);
  const toks = e.split(' ');
  const frames = useMemo(() => record(postfixFrames(toks)), [e]);
  const st = useStepper<PfFrame>(frames, 1.5);
  const f = st.frame;
  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PF.map((p) => <button key={p} className={`tt-preset ${p === e ? 'on' : ''}`} onClick={() => setE(p)}><span dir="ltr">{p}</span></button>)}
      </div>
      <div className="sq-text" dir="ltr">{toks.map((c, i) => <span key={i} className={`tok ${i === f.i ? (f.error ? 'bad' : 'on') : i < f.i ? 'past' : ''}`}>{c}</span>)}</div>
      <div className="sq-stack-wrap"><StackView items={f.stack.map(String)} /></div>
      <div className={`inv-banner ${f.error ? 'sq-bad' : f.done ? 'sq-ok' : 'on'}`}>{f.note}</div>
      <Player s={st} />
    </>
  );
}

function StackView({ items }: { items: string[] }) {
  return (
    <div className="sq-stack" dir="ltr">
      {items.length === 0 && <span className="sq-empty">empty</span>}
      {items.map((v, i) => <span key={i} className={i === items.length - 1 ? 'top' : ''}>{v}</span>)}
      <i className="sq-label">top →</i>
    </div>
  );
}

/** Three views of the same two interfaces: a circular array queue, a bracket checker and a postfix evaluator. */
export default function StackQueueLab() {
  const [tab, setTab] = useState<Tab>('queue');
  return (
    <div className="widget card sq">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الطابور الدائري، والمكدس في العمل</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {([['queue', 'طابور دائري'], ['brackets', 'توازن الأقواس'], ['postfix', 'التعبير اللاحق']] as [Tab, string][]).map(([t, l]) => (
          <button key={t} className={`pr-tab ${t === tab ? 'on' : ''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      {tab === 'queue' && <CircularQueue />}
      {tab === 'brackets' && <Brackets />}
      {tab === 'postfix' && <Postfix />}
    </div>
  );
}

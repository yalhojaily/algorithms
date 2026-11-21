import { useMemo, useState } from 'react';
import { BITS, arrayRun, counterRun, stackRun, type AmStep } from '../lib/amortized';
import { Tex } from './MathText';

type Mode = 'counter' | 'stack' | 'array';
type SOp = { op: 'push' | 'pop' | 'multipop'; k?: number };

/** Actual cost, potential and amortized cost, operation by operation. */
export default function AmortizedLab() {
  const [mode, setMode] = useState<Mode>('counter');
  const [cOps, setC] = useState<('inc' | 'dec')[]>([]);
  const [sOps, setS] = useState<SOp[]>([]);
  const [aN, setA] = useState(0);

  const steps: AmStep[] = useMemo(() => mode === 'counter' ? counterRun(cOps) : mode === 'stack' ? stackRun(sOps) : arrayRun(aN), [mode, cOps, sOps, aN]);
  const actual = steps.reduce((a, s) => a + s.cost, 0);
  const amort = steps.reduce((a, s) => a + s.amort, 0);
  const phi = steps.length ? steps[steps.length - 1].phi : 0;
  const bound = mode === 'array' ? 3 : 2;
  const shown = steps.slice(-48);
  const top = Math.max(bound + 1, ...shown.map((s) => Math.max(s.cost, s.phi, s.amort)));
  const W = 560, H = 160, L = 30, B = 20, T = 10, R = 10;
  const cw = (W - L - R) / Math.max(shown.length, 1);
  const Y = (v: number) => H - B - (Math.max(v, 0) / top) * (H - B - T);

  const reset = () => { setC([]); setS([]); setA(0); };
  const state = steps.length ? steps[steps.length - 1].state : mode === 'counter' ? '0'.repeat(BITS) : mode === 'stack' ? '0' : '0/1';
  const stackSize = mode === 'stack' ? Number(state) : 0;

  return (
    <div className="widget card am">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">التكلفة الفعلية، والجهد، والتكلفة المطفأة</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {([['counter', 'العداد الثنائي'], ['stack', 'مكدس مع multipop'], ['array', 'المصفوفة الديناميكية']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} className={`pr-tab ${m === mode ? 'on' : ''}`} onClick={() => { setMode(m); reset(); }}>{l}</button>
        ))}
      </div>

      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {mode === 'counter' && <>
          <button className="btn btn-sm" onClick={() => setC([...cOps, 'inc'])}>+1</button>
          <button className="btn btn-sm" onClick={() => setC([...cOps, ...Array(10).fill('inc')])}>+1 ×10</button>
          <button className="btn btn-sm" onClick={() => setC([...cOps, 'dec'])}>−1</button>
          <button className="btn btn-sm" onClick={() => { const pre: ('inc' | 'dec')[] = []; const cur = cOps.length ? parseInt(steps[steps.length - 1].state, 2) : 0; for (let v = cur; v !== 127; v = (v + 1) % 256) pre.push('inc'); const flip: ('inc' | 'dec')[] = []; for (let i = 0; i < 8; i++) flip.push('inc', 'dec'); setC([...cOps, ...pre, ...flip]); }}>⇄ تأرجح حول 128</button>
        </>}
        {mode === 'stack' && <>
          <button className="btn btn-sm" onClick={() => setS([...sOps, { op: 'push' }])}>push</button>
          <button className="btn btn-sm" onClick={() => setS([...sOps, ...Array(5).fill({ op: 'push' })])}>push ×5</button>
          <button className="btn btn-sm" onClick={() => setS([...sOps, { op: 'pop' }])}>pop</button>
          <button className="btn btn-sm" onClick={() => setS([...sOps, { op: 'multipop', k: 4 }])}>multipop(4)</button>
          <button className="btn btn-sm" onClick={() => setS([...sOps, { op: 'multipop', k: 100 }])}>multipop(100)</button>
        </>}
        {mode === 'array' && <>
          <button className="btn btn-sm" onClick={() => setA(aN + 1)}>push</button>
          <button className="btn btn-sm" onClick={() => setA(aN + 10)}>push ×10</button>
        </>}
        <button className="btn btn-sm" onClick={reset}>↺ من جديد</button>
      </div>

      <div className="am-state" dir="ltr">
        {mode === 'counter' && state.split('').map((b, i) => (
          <span key={i} className={`am-bit ${b === '1' ? 'one' : ''}`}>{b}{b === '1' && <i title="قطعة نقد مدخرة">●</i>}</span>
        ))}
        {mode === 'stack' && <div className="am-stack">{Array.from({ length: Math.min(stackSize, 40) }, (_, i) => <span key={i}>●</span>)}{stackSize > 40 && <em>+{stackSize - 40}</em>}{stackSize === 0 && <em>empty</em>}</div>}
        {mode === 'array' && <div className="am-arr">n / cap = <b>{state}</b></div>}
      </div>

      <div className="am-pot">
        {mode === 'counter' && <>الجهد: <Tex>{'\\Phi = '}</Tex> عدد الآحاد. كل واحد يحمل قطعة نقد ● ادُّخرت حين صار 1، وستدفع ثمن إعادته إلى 0.</>}
        {mode === 'stack' && <>الجهد: <Tex>{'\\Phi = '}</Tex> عدد العناصر في المكدس. كل عنصر يحمل قطعة نقد تدفع ثمن إخراجه لاحقًا.</>}
        {mode === 'array' && <>الجهد: <Tex>{'\\Phi = \\max(0,\\ 2n - \\text{cap})'}</Tex>. يتراكم مع كل إلحاق، ويُنفق كله في النسخ.</>}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="lc-svg" style={{ direction: 'ltr' }}>
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} className="lc-axis" />
        <line x1={L} x2={W - R} y1={Y(bound)} y2={Y(bound)} className="am-bound" />
        <text x={L - 4} y={Y(bound) + 4} textAnchor="end" className="lc-lbl">{bound}</text>
        <text x={L - 4} y={Y(top) + 8} textAnchor="end" className="lc-lbl">{top}</text>
        {shown.map((s, i) => <rect key={i} x={L + i * cw + 1} width={Math.max(cw - 2, 1)} y={Y(s.cost)} height={H - B - Y(s.cost)} className="am-cost"><title>{`${s.op}: ${s.cost}`}</title></rect>)}
        {shown.length > 0 && <polyline fill="none" className="am-phi" points={shown.map((s, i) => `${L + (i + 0.5) * cw},${Y(s.phi)}`).join(' ')} />}
        {shown.map((s, i) => <circle key={`a${i}`} cx={L + (i + 0.5) * cw} cy={Y(s.amort)} r={2.6} className={s.amort > bound ? 'am-am bad' : 'am-am'} />)}
      </svg>
      <div className="gc-legend">
        <span className="gc-key on ar"><i style={{ background: 'var(--ink-3)' }} />التكلفة الفعلية</span>
        <span className="gc-key on ar"><i style={{ background: 'var(--blue)' }} />الجهد Φ</span>
        <span className="gc-key on ar"><i style={{ background: 'var(--brand)' }} />المطفأة = الفعلية + ΔΦ</span>
        <span className="gc-key on ar"><i style={{ background: 'var(--green)' }} />الحد {bound}</span>
      </div>

      <div className="da-stats">
        <div><span>العمليات</span><b>{steps.length}</b></div>
        <div><span>مجموع الفعلية</span><b>{actual}</b></div>
        <div><span>مجموع المطفأة</span><b>{amort}</b></div>
        <div><span>الجهد الآن</span><b>{phi}</b></div>
        <div><span>{bound} × العمليات</span><b>{bound * steps.length}</b></div>
      </div>
      <div className="vm-help">
        مجموع المطفأة = مجموع الفعلية + (Φ النهائي − Φ الابتدائي). فما دام Φ لا يصبح أقل من قيمته الابتدائية، يبقى مجموع الفعلية ≤ مجموع المطفأة ≤ {bound} × العمليات.
        {mode === 'counter' && cOps.includes('dec') && ' لاحظ أن الطرح يكسر الحد: عملية −1 على 10000000 تقلب 8 بتات وترفع الجهد، فمطفأتها كبيرة. الحد 2 يصح للزيادة وحدها.'}
      </div>
    </div>
  );
}

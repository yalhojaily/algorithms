import { useMemo, useState } from 'react';
import { BOOK_CIRCUIT, bitsOf, clauseTrue, evalCircuit, litText, satisfyingInputs, tseitin } from '../lib/nphard';

type Mode = 'game' | 'sat' | 'cnf';
const C = BOOK_CIRCUIT;
// layout (grid units): inputs on the left, gates by column, as in Figure 12.5
const U = 46, IN_Y = [0, 1, 2, 3, 4];
const GATE_XY: [number, number][] = [[2.2, 0.2], [2.2, 3.4], [3.6, 2.7], [4.4, 0.6], [3.6, 1.6], [3.6, 4.2], [5.2, 2.1], [6.6, 2.1]];

function Gate({ op, x, y, on }: { op: string; x: number; y: number; on: boolean }) {
  const w = 34, h = op === 'not' ? 22 : 30;
  return (
    <g className={`cl-gate ${on ? 'on' : ''}`} transform={`translate(${x - w / 2},${y - h / 2})`}>
      <rect width={w} height={h} rx={op === 'and' ? 10 : op === 'or' ? 14 : 4} />
      <text x={w / 2} y={h / 2} dy="0.35em">{op === 'and' ? 'AND' : op === 'or' ? 'OR' : 'NOT'}</text>
    </g>
  );
}

/** The Adversary's box (Figure 12.2): flip switches, brute-force all 2^n settings, and see the formula and 3CNF transcriptions. */
export default function CircuitLab({ mode = 'game' }: { mode?: Mode }) {
  const [x, setX] = useState<boolean[]>([false, false, false, false, false]);
  const [tried, setTried] = useState<Set<number>>(new Set());
  const w = evalCircuit(C, x), out = w.at(-1)!;
  const sols = useMemo(() => satisfyingInputs(C), []);
  const T = useMemo(() => tseitin(C), []);
  const code = x.reduce((a, b, i) => a + (b ? 1 << i : 0), 0);
  const flip = (i: number) => { const y = x.map((b, j) => (j === i ? !b : b)); setX(y); setTried(new Set(tried).add(y.reduce((a, b, j) => a + (b ? 1 << j : 0), 0))); };
  const setCode = (m: number) => { setX(bitsOf(m, 5)); setTried(new Set(tried).add(m)); };
  const PX = (gx: number) => 40 + gx * U, PY = (gy: number) => 24 + gy * U;
  const src = (wi: number): [number, number] => (wi < C.n ? [PX(0.5), PY(IN_Y[wi])] : [PX(GATE_XY[wi - C.n][0]) + 17, PY(GATE_XY[wi - C.n][1])]);
  const wires: { d: string; on: boolean; key: string }[] = [];
  C.gates.forEach((g, gi) => {
    const [gx, gy] = GATE_XY[gi], tx = PX(gx) - 17, n = g.ins.length;
    g.ins.forEach((wi, k) => {
      const [sx, sy] = src(wi), ty = PY(gy) + (n === 1 ? 0 : (k - (n - 1) / 2) * 9), mx = tx - 10 - k * 4;
      wires.push({ key: `${gi}-${k}`, on: w[wi], d: `M${sx},${sy} H${mx} V${ty} H${tx}` });
    });
  });
  const [ox, oy] = src(C.n + C.gates.length - 1);
  const W = PX(8.2), H = PY(4.6);
  // stage 2 and stage 4 views for the current input (wires computed, padding variables set to false)
  const wBin = evalCircuit(T.bin, x), full = [...wBin, ...T.vars.slice(wBin.length).map(() => false)];
  const eqs = C.gates.map((g) => `${g.name} = ${g.op === 'not' ? '¬' + C.inputs.concat(C.gates.map((q) => q.name))[g.ins[0]] : g.ins.map((i) => C.inputs.concat(C.gates.map((q) => q.name))[i]).join(g.op === 'and' ? ' ∧ ' : ' ∨ ')}`);
  return (
    <div className="widget card cl">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">{mode === 'game' ? 'صندوق الخصم: هل يضيء المصباح؟' : mode === 'sat' ? 'من دارة إلى صيغة' : 'من دارة إلى 3CNF'}</span></div>
      <div className="vm-help">انقر المفاتيح يسارًا. الأسلاك الكهرمانية تحمل True.</div>
      <div className="xm-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="cl-svg" direction="ltr">
          {wires.map((wr) => <path key={wr.key} d={wr.d} className={`cl-w ${wr.on ? 'on' : ''}`} />)}
          <path d={`M${ox},${oy} H${PX(7.7)}`} className={`cl-w ${out ? 'on' : ''}`} />
          {x.map((b, i) => (
            <g key={i} className={`cl-sw ${b ? 'on' : ''}`} onClick={() => flip(i)} transform={`translate(${PX(0) - 22},${PY(IN_Y[i]) - 11})`}>
              <rect width={44} height={22} rx={11} /><circle cx={b ? 33 : 11} cy={11} r={8} />
              <text x={-6} y={11} dy="0.35em" textAnchor="end">{C.inputs[i]}</text>
            </g>
          ))}
          {C.gates.map((g, gi) => <Gate key={gi} op={g.op} x={PX(GATE_XY[gi][0])} y={PY(GATE_XY[gi][1])} on={w[C.n + gi]} />)}
          {C.gates.map((g, gi) => <text key={gi} className="cl-lab" x={PX(GATE_XY[gi][0]) + 20} y={PY(GATE_XY[gi][1]) - 12}>{g.name}</text>)}
          <g className={`cl-bulb ${out ? 'on' : ''}`}><circle cx={PX(7.95)} cy={oy} r={14} /><text x={PX(7.95)} y={oy} dy="0.35em">💡</text></g>
        </svg>
      </div>
      {mode === 'game' && <>
        <div className="da-stats">
          <span>المصباح: <b>{out ? 'مضاء' : 'مطفأ'}</b></span>
          <span>جربت <b className="ltr">{tried.size}</b> من <bdi dir="ltr">2⁵ = 32</bdi></span>
          <span>الحلول الكلية: <b className="ltr">{sols.length}</b></span>
        </div>
        <div className="bb-pick">
          <button className="pr-tab" onClick={() => setCode((code + 1) % 32)}>الإعداد التالي (عدّ ثنائي)</button>
          <button className="pr-tab" onClick={() => { setTried(new Set([...Array(32)].map((_, i) => i))); setX(sols[0]); }}>جرّب الـ32 كلها</button>
          <button className="pr-tab" onClick={() => { setTried(new Set()); setX([false, false, false, false, false]); }}>من جديد</button>
        </div>
        <div className="edl-msg">{tried.size === 32 ? <>بالقوة الغاشمة: {sols.length} إعدادًا من 32 تضيء المصباح، وهذا واحد منها. ومع n مفتاحًا تحتاج <bdi dir="ltr">2ⁿ</bdi> تجربة: مع 100 مفتاح، أكثر من عمر الكون.</> : <>حساب المخرج لإعداد واحد سهل: سلك بعد سلك. أما السؤال «هل يوجد إعداد يضيء المصباح؟» فلا يُعرف له طريق أسرع جوهريًا من تجربة الإعدادات.</>}</div>
      </>}
      {mode === 'sat' && <div className="cl-eqs">
        {eqs.map((e, gi) => {
          const g = C.gates[gi], v = w[C.n + gi];
          return <span key={gi} className="ok"><bdi dir="ltr">({e})</bdi> <small>{g.name} = {v ? 'T' : 'F'}</small></span>;
        })}
        <span className={out ? 'ok' : 'bad'}><bdi dir="ltr">z</bdi> <small>{out ? 'T' : 'F'}</small></span>
        <div className="edl-msg">كل معادلة صحيحة حين تُعطى المتغيرات <bdi dir="ltr">yᵢ</bdi> قيم أسلاكها. فالصيغة Φ (المعادلات كلها و<bdi dir="ltr">z</bdi>) صحيحة إن وفقط إن أضاء المصباح. {out ? 'وهو مضاء الآن: Φ صحيحة.' : 'والمصباح مطفأ: البند الأخير z خاطئ.'}</div>
      </div>}
      {mode === 'cnf' && <>
        <div className="da-stats">
          <span>البوابات الثنائية: <b className="ltr">{T.bin.gates.length}</b></span>
          <span>بنود المرحلة 3: <b className="ltr">{T.cnf2.length}</b></span>
          <span>بنود 3CNF: <b className="ltr">{T.cnf3.length}</b></span>
          <span>متغيرات الحشو: <b className="ltr">{T.vars.length - wBin.length}</b></span>
        </div>
        <div className="cl-eqs cl-cnf">
          {T.cnf3.map(({ clause }, i) => <span key={i} className={clauseTrue(clause, full) ? 'ok' : 'bad'}><bdi dir="ltr">({clause.map((l) => litText(T.vars, l)).join(' ∨ ')})</bdi></span>)}
        </div>
        <div className="edl-msg">قيم الأسلاك من الدارة، ومتغيرات الحشو <bdi dir="ltr">pᵢ</bdi> كلها False (أي قيمة تصلح). {out ? 'المصباح مضاء، فكل البنود صحيحة.' : 'المصباح مطفأ، فالبنود الحمراء (المشتقة من البند الأخير z) خاطئة.'}</div>
      </>}
    </div>
  );
}

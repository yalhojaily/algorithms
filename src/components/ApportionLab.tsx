import { useMemo, useState } from 'react';
import { METHODS, apportion, apportionFrames, quotas, type AFrame, type Method } from '../lib/apportion';
import { Player, useStepper } from '../engine/stepper';

const NAMES = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
const PRESETS: { ar: string; pop: number[] }[] = [
  { ar: 'ست ولايات متفاوتة', pop: [2_560_000, 1_330_000, 610_000, 4_870_000, 180_000, 950_000] },
  { ar: 'ولاية عملاقة وولايات صغيرة', pop: [9_200_000, 3_100_000, 1_400_000, 620_000, 260_000, 95_000] },
];
const fmtP = (p: number) => (p === Infinity ? '∞' : Math.round(p).toLocaleString('en'));

/** Seats handed out one at a time to the highest priority, for three priority formulas. */
export default function ApportionLab() {
  const [preset, setPreset] = useState(0);
  const [R, setR] = useState(12);
  const [method, setMethod] = useState<Method>('hh');
  const pop = PRESETS[preset].pop;
  const frames = useMemo(() => apportionFrames(pop, R, method), [pop, R, method]);
  const s = useStepper<AFrame>(frames, 2);
  const f = s.frame;
  const q = quotas(pop, R);
  const finals = (['hh', 'dhondt', 'webster'] as Method[]).map((m) => ({ m, rep: apportion(pop, R, m) }));
  const maxSeats = Math.max(...finals.flatMap((x) => x.rep), ...q.map(Math.ceil));
  return (
    <div className="widget card apl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">توزيع المقاعد بالأولوية</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((p, i) => <button key={i} className={`tt-preset ${i === preset ? 'on' : ''}`} onClick={() => setPreset(i)}>{p.ar}</button>)}
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {(Object.keys(METHODS) as Method[]).map((m) => (
          <button key={m} className={`tt-preset ${m === method ? 'on' : ''}`} onClick={() => setMethod(m)}>{METHODS[m].ar}</button>
        ))}
      </div>
      <div className="ap-sliders">
        <label><span>عدد المقاعد R = <b>{R}</b></span><input type="range" min={6} max={30} value={R} onChange={(e) => setR(+e.target.value)} /></label>
        <div className="apl-formula">الأولوية: <bdi dir="ltr">{METHODS[method].formula}</bdi>، حيث P عدد السكان وr عدد المقاعد التي أخذتها الولاية حتى الآن.</div>
      </div>
      <div className="apl-rows">
        {pop.map((P, i) => (
          <div key={i} className={`apl-row ${f.last === i ? 'got' : ''}`}>
            <span className="apl-name">{NAMES[i]}<small className="ltr">{(P / 1e6).toFixed(2)}M</small></span>
            <span className="apl-bar" dir="ltr">
              {Array.from({ length: maxSeats }, (_, k) => <i key={k} className={k < f.rep[i] ? 'on' : ''} />)}
              <em style={{ left: `calc(${(q[i] / maxSeats) * 100}% )` }} title="الحصة المثالية" />
            </span>
            <span className="apl-n ltr">{f.rep[i]}</span>
          </div>
        ))}
      </div>
      <div className="apl-q">
        <div className="apl-qh">طابور الأولوية بعد هذه الخطوة (الأعلى يأخذ المقعد التالي):</div>
        <div className="apl-qi" dir="ltr">
          {f.queue.slice(0, 6).map((e, k) => <span key={e.s} className={k === 0 ? 'top' : ''}><b>{NAMES[e.s]}</b> {fmtP(e.p)}</span>)}
        </div>
      </div>
      <div className="da-stats">
        <span>المقاعد الموزعة: <b className="ltr">{f.seat}</b> من <b className="ltr">{R}</b></span>
        <span>{f.last === null ? (method === 'hh' ? 'كل الأولويات ∞ في البداية: أول مقعد لكل ولاية مضمون' : 'لا مقاعد بعد') : <>المقعد {f.seat} ذهب إلى الولاية {NAMES[f.last]}</>}</span>
      </div>
      <table className="apl-cmp">
        <thead><tr><th>الولاية</th><th>الحصة المثالية</th>{finals.map(({ m }) => <th key={m} className={m === method ? 'on' : ''}>{METHODS[m].en}</th>)}</tr></thead>
        <tbody>
          {pop.map((_, i) => (
            <tr key={i}>
              <td>{NAMES[i]}</td>
              <td className="ltr">{q[i].toFixed(2)}</td>
              {finals.map(({ m, rep }) => (
                <td key={m} className={`ltr ${m === method ? 'on' : ''} ${rep[i] > Math.ceil(q[i]) || rep[i] < Math.floor(q[i]) ? 'bad' : ''}`}>{rep[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="vm-help">الخط الرأسي على كل شريط هو الحصة المثالية <bdi dir="ltr">P · R / ΣP</bdi>. والخانة الحمراء في الجدول تعني أن الطريقة ابتعدت عن الحصة بأكثر من مقعد (الحصة مقرّبة لأعلى أو لأسفل). جرّب الإعداد الأول مع R = 12 وطريقة D'Hondt.</div>
      <Player s={s} />
    </div>
  );
}

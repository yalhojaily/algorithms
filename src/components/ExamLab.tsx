import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { EXAMS, schedule } from '../lib/flowapps';
import type { G } from '../lib/bookgraphs';

/** Exam scheduling as tuple selection: class → room → time → proctor. Toggle availability, change the per-proctor limit. */
export default function ExamLab() {
  const [avail, setAvail] = useState(EXAMS.avail.map((r) => [...r]));
  const [maxPer, setMaxPer] = useState(EXAMS.maxPer);
  const x = useMemo(() => ({ ...EXAMS, avail, maxPer }), [avail, maxPer]);
  const { rows, value, f, net } = useMemo(() => schedule(x), [x]);
  const n = x.enroll.length, r = x.seats.length, T = x.times, p = x.proctors;
  const mid = (k: number) => (n - 1) / 2 - (k - 1) / 2;
  const g: G = {
    names: ['s′', ...x.enroll.map((_, i) => `c${i + 1}`), ...x.seats.map((_, j) => `R${j + 1}`), ...[...Array(T)].map((_, k) => `T${k + 1}`), ...[...Array(p)].map((_, l) => `P${l + 1}`), 't′'],
    xy: [[0, (n - 1) / 2], ...x.enroll.map((_, i) => [1.2, i] as [number, number]), ...x.seats.map((_, j) => [2.4, mid(r) + j * 1.0] as [number, number]),
      ...[...Array(T)].map((_, k) => [3.6, mid(T) + k] as [number, number]), ...[...Array(p)].map((_, l) => [4.8, mid(p) + l * 1.2] as [number, number]), [6.0, (n - 1) / 2]],
    edges: net.E.map(([u, v]) => [u, v]),
  };
  const flip = (k: number, l: number) => setAvail(avail.map((row, a) => row.map((c, b) => (a === k && b === l ? !c : c))));
  const ok = value === n;
  return (
    <div className="widget card xm">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">جدولة الاختبارات بأكبر تدفق</span></div>
      <div className="xm-grid">
        <div className="xm-box"><h4>المدخلات</h4>
          <table className="xm-t"><tbody>
            <tr><th>الصف</th>{x.enroll.map((_, i) => <th key={i}><bdi dir="ltr">c{i + 1}</bdi></th>)}</tr>
            <tr><th>الطلاب <bdi dir="ltr">E[i]</bdi></th>{x.enroll.map((e, i) => <td key={i}>{e}</td>)}</tr>
          </tbody></table>
          <table className="xm-t" style={{ marginTop: 6 }}><tbody>
            <tr><th>القاعة</th>{x.seats.map((_, j) => <th key={j}><bdi dir="ltr">R{j + 1}</bdi></th>)}</tr>
            <tr><th>المقاعد <bdi dir="ltr">S[j]</bdi></th>{x.seats.map((e, j) => <td key={j}>{e}</td>)}</tr>
          </tbody></table>
        </div>
        <div className="xm-box"><h4>توفر المراقبين <bdi dir="ltr">A[k, ℓ]</bdi> (انقر للتغيير)</h4>
          <table className="xm-t"><tbody>
            <tr><th></th>{[...Array(p)].map((_, l) => <th key={l}><bdi dir="ltr">P{l + 1}</bdi></th>)}</tr>
            {avail.map((row, k) => <tr key={k}><th><bdi dir="ltr">T{k + 1}</bdi></th>{row.map((c, l) => <td key={l}><button className={`xm-av ${c ? 'on' : ''}`} onClick={() => flip(k, l)}>{c ? '✓' : '·'}</button></td>)}</tr>)}
          </tbody></table>
          <div className="xm-ctl" style={{ marginTop: 8 }}>
            <label htmlFor="xm-max">أقصى عدد لكل مراقب: <b className="ltr">{maxPer}</b></label>
            <input id="xm-max" type="range" min={1} max={3} value={maxPer} onChange={(e) => setMaxPer(+e.target.value)} />
          </div>
        </div>
      </div>
      <div className="xm-wrap">
        <GraphSvg g={g} st={{ directed: true, scale: 62, r: 15,
          eLabel: (u, v) => { const k = net.E.findIndex(([a, b]) => a === u && b === v); const c = net.E[k][2]; return v === net.t ? `${f[k]}/${c}` : null; },
          eClass: (u, v) => { const k = net.E.findIndex(([a, b]) => a === u && b === v); return f[k] > 0 ? 'tree' : 'dim'; } }} />
      </div>
      <table className="xm-t" style={{ marginBottom: 10 }}><tbody>
        <tr><th>الصف</th><th>القاعة</th><th>الوقت</th><th>المراقب</th></tr>
        {rows.map((row, i) => <tr key={i}><th><bdi dir="ltr">c{i + 1}</bdi></th>
          {row ? row.map((v, j) => <td key={j}><bdi dir="ltr">{['R', 'T', 'P'][j]}{v + 1}</bdi></td>) : <td colSpan={3} className="bad">بلا موعد</td>}</tr>)}
      </tbody></table>
      <div className="edl-msg">
        {ok ? <>أكبر تدفق <bdi dir="ltr">|f*| = {value} = n</bdi>: كل مسار من <bdi dir="ltr">s′</bdi> إلى <bdi dir="ltr">t′</bdi> رباعية (صف، قاعة، وقت، مراقب)، والجدول أعلاه قراءة لتحليل التدفق.</>
          : <>أكبر تدفق <bdi dir="ltr">|f*| = {value} &lt; n = {n}</bdi>: لا جدول يشمل كل الصفوف. والحواف الباهتة لا تحمل تدفقًا.</>}
      </div>
    </div>
  );
}

import { useState } from 'react';
import GraphSvg from './GraphSvg';
import { SS_G, base4, subsetSumFromVC } from '../lib/nphard';

/** Vertex cover → subset sum (Section 12.12): base-4 digits, one column per edge, no carries. */
export default function SubsetSumLab() {
  const g = SS_G, nm = g.names;
  const [C, setC] = useState<Set<number>>(new Set([1, 2]));
  const [k, setK] = useState(2);
  const { a, b, T, E } = subsetSumFromVC(g, k);
  const toggle = (v: number) => { const D = new Set(C); if (D.has(v)) D.delete(v); else D.add(v); setC(D); };
  const ends = g.edges.map(([u, v]) => (C.has(u) ? 1 : 0) + (C.has(v) ? 1 : 0));
  const useB = ends.map((c) => c === 1);
  const sum = [...C].reduce((s, v) => s + a[v], 0) + b.reduce((s, x, e) => s + (useB[e] ? x : 0), 0);
  const D = E + 1, en = (e: number) => nm[g.edges[e][0]] + nm[g.edges[e][1]];
  const digitSum = base4(sum - Math.floor(sum / 4 ** E) * 4 ** E, D).slice(1);
  const ok = sum === T;
  const row = (label: string, x: number, on: boolean, key: string) => (
    <tr key={key} className={on ? 'on' : ''}><th><bdi dir="ltr">{label}</bdi></th>{base4(x, D).map((d, i) => <td key={i}>{d}</td>)}<td className="ss-dec">{x}</td></tr>
  );
  return (
    <div className="widget card ss">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">من غطاء الرؤوس إلى مجموع جزئي</span></div>
      <div className="xm-ctl">
        <span>انقر الرؤوس لتختار الغطاء C.</span>
        <label htmlFor="ss-k">k = <b className="ltr">{k}</b></label>
        <input id="ss-k" type="range" min={1} max={4} value={k} onChange={(e) => setK(+e.target.value)} />
      </div>
      <GraphSvg g={g} st={{ scale: 80, r: 16, onClick: toggle, vClass: (v) => (C.has(v) ? 'c1' : ''),
        eClass: (u, v) => { const e = g.edges.findIndex(([p, q]) => p === u && q === v); return ends[e] === 0 ? 'hot' : ends[e] === 1 ? 'tree' : ''; } }} />
      <div className="xm-wrap"><table className="xm-t ss-t" dir="ltr"><tbody>
        <tr><th></th><th>flag</th>{g.edges.map((_, e) => <th key={e}>{en(e)}</th>)}<th>decimal</th></tr>
        {nm.map((x, v) => row(`a_${x}`, a[v], C.has(v), `a${v}`))}
        {g.edges.map((_, e) => row(`b_${en(e)}`, b[e], useB[e], `b${e}`))}
        <tr className="sum"><th>Σ</th><td>{Math.floor(sum / 4 ** E)}</td>{digitSum.map((d, i) => <td key={i} className={d === 2 ? '' : 'bad'}>{d}</td>)}<td className="ss-dec">{sum}</td></tr>
        <tr className="sum"><th>T</th>{base4(T, D).map((d, i) => <td key={i}>{d}</td>)}<td className="ss-dec">{T}</td></tr>
      </tbody></table></div>
      <div className={`pj-verdict ${ok ? 'ok' : 'bad'}`}>
        {ok ? <>المجموع يساوي T: نأخذ <bdi dir="ltr">a_v</bdi> لكل رأس في الغطاء، و<bdi dir="ltr">b_i</bdi> لكل حافة لها طرف واحد فيه، فيصير كل رقم حافة 2 بالضبط، والرقم الأول k.</>
          : <>المجموع لا يساوي T. {ends.some((c) => c === 0) ? 'الحواف الكهرمانية بلا طرف في C: رقمها 0 أو 1 مهما فعلنا، لا 2.' : ''} {C.size !== k ? `الرقم الأول ${C.size} لا ${k}: يجب أن يكون في الغطاء k رأسًا بالضبط.` : ''}</>}
      </div>
    </div>
  );
}

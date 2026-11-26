import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { BOOK_3CNF, clauseTrue, hamFromSat, litText, litTrue } from '../lib/nphard';
import type { G } from '../lib/bookgraphs';

/** 3SAT → directed Hamiltonian cycle (Figures 12.19–12.20): the assignment chooses the direction of each row. */
export default function HamSatLab() {
  const f = BOOK_3CNF, n = f.vars.length, k = f.clauses.length;
  const H = useMemo(() => hamFromSat(f), []), W = H.W;
  const [a, setA] = useState<boolean[]>([true, true, false, true]);
  const sat = f.clauses.map((c) => clauseTrue(c, a));
  const pick = f.clauses.map((c) => c.find((l) => litTrue(l, a)) ?? null);
  // the walk: rows in order, each in its direction, with detours where possible
  const seq: number[] = [];
  for (let i = 0; i < n; i++) {
    const cols = [...Array(W)].map((_, j) => (a[i] ? j : W - 1 - j));
    for (const j of cols) {
      seq.push(H.id(i, j));
      pick.forEach((p, c) => { if (p && p.v === i && ((a[i] && j === H.slot(c)[0]) || (!a[i] && j === H.slot(c)[1]))) seq.push(H.cl(c)); });
    }
  }
  const walk = new Set(seq.map((u, i) => `${u},${seq[(i + 1) % seq.length]}`));
  const clauseEdges = H.edges.filter(([u, v]) => u >= n * W || v >= n * W);
  const edges: [number, number][] = [...seq.map((u, i) => [u, seq[(i + 1) % seq.length]] as [number, number]), ...clauseEdges.filter(([u, v]) => !walk.has(`${u},${v}`))];
  const g: G = {
    names: [...[...Array(n * W)].map((_, u) => (u % W === 0 ? f.vars[Math.floor(u / W)] : '')), ...f.clauses.map((_, j) => String(j + 1))],
    xy: [...[...Array(n * W)].map((_, u) => [(u % W) * 0.5, 1.1 + Math.floor(u / W) * 0.95] as [number, number]), ...f.clauses.map((_, j) => [(3 * j + 1.5) * 0.5, 0] as [number, number])],
    edges,
  };
  const all = sat.every(Boolean);
  return (
    <div className="widget card hs">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">من 3SAT إلى دورة هاملتونية</span></div>
      <div className="bb-pick">{f.vars.map((x, i) => <button key={x} className={`pr-tab ${a[i] ? 'on' : ''}`} onClick={() => setA(a.map((b, j) => (j === i ? !b : b)))}><bdi dir="ltr">{x} = {a[i] ? 'True →' : 'False ←'}</bdi></button>)}</div>
      <div className="vm-help">صف لكل متغير (<bdi dir="ltr">{f.vars.join(', ')}</bdi> من الأعلى بعد عقد البنود)، يُمشى يمينًا إن كان True ويسارًا إن كان False. والعقد المرقمة في الأعلى هي البنود، والعقد المتقطعة فواصل بين «فتحات» البنود (التصحيح في الشرح).</div>
      <div className="xm-wrap">
        <GraphSvg g={g} st={{ directed: true, scale: 58, r: 9,
          vClass: (v) => (v >= n * W ? (sat[v - n * W] ? 'c1' : 'c5') : v % W !== 0 && v % W % 3 === 0 ? 'bagged' : ''),
          eClass: (u, v) => (walk.has(`${u},${v}`) ? (u >= n * W || v >= n * W ? 'hot' : 'tree') : 'dim') }} />
      </div>
      <div className="cl-eqs">{f.clauses.map((c, j) => <span key={j} className={sat[j] ? 'ok' : 'bad'}><bdi dir="ltr">{j + 1}: ({c.map((l) => litText(f.vars, l)).join(' ∨ ')})</bdi>{pick[j] && <small> ← {litText(f.vars, pick[j]!)}</small>}</span>)}</div>
      <div className={`pj-verdict ${all ? 'ok' : 'bad'}`}>
        {all ? <>كل بند فيه حرف صحيح، فالدورة تلتقط كل عقد البنود (الحواف الكهرمانية) على صف ذلك الحرف وفي اتجاهه: دورة هاملتونية في H.</>
          : <>البنود الحمراء بلا حرف صحيح: لا صف يمر بجانبها في الاتجاه الذي تقبله حوافها، فلا تلتقطها الدورة. وهذا ليس دليلًا كافيًا على غياب الدورة كليًا؛ البرهان في النص يستبعد الطرق الأخرى.</>}
      </div>
    </div>
  );
}

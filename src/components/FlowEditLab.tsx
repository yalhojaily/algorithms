import { useState } from 'react';
import GraphSvg from './GraphSvg';
import { FLOW_NET, cap, excess, value } from '../lib/flow';

const START = [8, 2, 0, 8, 0, 2, 0, 8, 2];   // a feasible flow of value 10

/** Edit a flow edge by edge: conservation at every vertex except s and t, and 0 ≤ f ≤ c. */
export default function FlowEditLab() {
  const net = FLOW_NET, nm = net.names, n = nm.length;
  const [f, setF] = useState<number[]>(START);
  const ex = excess(net, f);
  const bad = net.edges.map((_, k) => f[k] < 0 || f[k] > cap(net, k));
  const unbalanced = nm.map((_, v) => v !== 0 && v !== n - 1 && ex[v] !== 0);
  const feasible = !bad.some(Boolean) && !unbalanced.some(Boolean);
  const set = (k: number, d: number) => setF(f.map((x, i) => (i === k ? x + d : x)));
  const idx = (u: number, v: number) => net.edges.findIndex(([a, b]) => a === u && b === v);
  return (
    <div className="widget card fe">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">ابنِ تدفقًا بيدك</span></div>
      <GraphSvg g={net} st={{ directed: true, scale: 70, r: 15,
        eLabel: (u, v) => { const k = idx(u, v); return `${f[k]}/${cap(net, k)}`; },
        eClass: (u, v) => { const k = idx(u, v); return bad[k] ? 'back' : f[k] === cap(net, k) && f[k] > 0 ? 'tree' : f[k] > 0 ? 'cross' : ''; },
        vClass: (v) => (unbalanced[v] ? 'c5' : v === 0 || v === n - 1 ? 'c2' : 'c1'),
        label: (v) => (v === 0 || v === n - 1 ? null : ex[v] === 0 ? '✓' : `${-ex[v] > 0 ? '+' : ''}${-ex[v]}`),
      }} />
      <div className="vm-help">على كل حافة <bdi dir="ltr">f/c</bdi>. الأحمر المتصل مشبعة (f = c). وفوق كل رأس داخلي ✓ إن كان ما يدخله يساوي ما يخرج، وإلا الفرق.</div>
      <div className="mc-edges" dir="ltr">
        {net.edges.map(([u, v], k) => (
          <span key={k} className="fe-e">
            <button onClick={() => set(k, -1)}>−</button>{nm[u]}{nm[v]}: {f[k]}<button onClick={() => set(k, 1)}>+</button>
          </span>
        ))}
      </div>
      <div className="da-stats">
        <span>قيمة التدفق <bdi dir="ltr">|f|</bdi>: <b className="ltr">{value(net, f)}</b></span>
        <span>صافي الداخل إلى t: <b className="ltr">{-ex[n - 1]}</b></span>
        <span>ممكن (feasible)؟ <b>{feasible ? 'نعم' : 'لا'}</b></span>
      </div>
      <div className="edl-msg">
        {feasible ? <>تدفق ممكن قيمته {value(net, f)}. ولاحظ: ما يخرج من s يساوي دائمًا ما يدخل t، لأن كل الرؤوس الأخرى متوازنة.</>
          : unbalanced.some(Boolean) ? <>قيد الحفظ مكسور عند <bdi dir="ltr">{nm.filter((_, v) => unbalanced[v]).join(', ')}</bdi>: ما يدخل لا يساوي ما يخرج.</>
            : <>حافة تجاوزت سعتها أو صارت سالبة.</>}
      </div>
      <button className="btn btn-sm" onClick={() => setF(START)}>البداية</button>
    </div>
  );
}

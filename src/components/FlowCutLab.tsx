import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { FLOW_NET, cap, cutCapacity, fordFulkersonFrames } from '../lib/flow';

/** Choose S (s is always in S, t never): capacity counts S → T edges only. */
export default function FlowCutLab() {
  const net = FLOW_NET, nm = net.names, n = nm.length;
  const [S, setS] = useState<Set<number>>(new Set([0, 1]));
  const max = useMemo(() => fordFulkersonFrames(net, 'bfs').at(-1)!, [net]);
  const toggle = (v: number) => { if (v === 0 || v === n - 1) return; const T = new Set(S); if (T.has(v)) T.delete(v); else T.add(v); setS(T); };
  const capS = cutCapacity(net, S);
  const idx = (u: number, v: number) => net.edges.findIndex(([a, b]) => a === u && b === v);
  const fwd = net.edges.filter(([u, v]) => S.has(u) && !S.has(v)).map(([u, v]) => idx(u, v));
  const back = net.edges.filter(([u, v]) => !S.has(u) && S.has(v)).map(([u, v]) => idx(u, v));
  const nk = (k: number) => `${nm[net.edges[k][0]]}→${nm[net.edges[k][1]]}`;
  return (
    <div className="widget card fc">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">قطع (S, T) وسعته</span></div>
      <div className="vm-help">انقر الرؤوس الداخلية لتنقلها بين S (الأخضر) وT. الحواف الكهرمانية من S إلى T وحدها تُحسب.</div>
      <GraphSvg g={net} st={{ directed: true, scale: 70, r: 15, weights: true, onClick: toggle,
        vClass: (v) => (S.has(v) ? 'c1' : 'c3'),
        eClass: (u, v) => { const k = idx(u, v); return fwd.includes(k) ? 'hot' : back.includes(k) ? 'dim' : ''; },
      }} />
      <div className="da-stats">
        <span>سعة القطع <bdi dir="ltr">‖S, T‖</bdi>: <b className="ltr">{capS}</b></span>
        <span>الحواف المحسوبة: <bdi dir="ltr">{fwd.map(nk).join(' + ') || '—'}</bdi></span>
        <span>أكبر تدفق: <b className="ltr">{max.value}</b></span>
      </div>
      <div className="edl-msg">
        {capS === max.value ? <><b>قطع أصغر!</b> سعته تساوي أكبر تدفق، فلا قطع أصغر منه (المأخذ 10.1). وأكبر تدفق يشبع كل حافة من S إلى T: <bdi dir="ltr">{fwd.map((k) => `${max.f[k]}/${cap(net, k)}`).join(', ')}</bdi>.</>
          : <>كل تدفق ممكن قيمته ≤ {capS}. وأكبر تدفق {max.value}، فهذا القطع ليس الأصغر. جرّب أن تجد قطعًا بسعة {max.value}.</>}
        {back.length > 0 && <> والحواف من T إلى S (<bdi dir="ltr">{back.map(nk).join(', ')}</bdi>) لا تُحسب أبدًا.</>}
      </div>
    </div>
  );
}

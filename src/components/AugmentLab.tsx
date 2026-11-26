import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { FLOW_NET, cap, fordFulkersonFrames, residualArcs, type FFrame, type Rule } from '../lib/flow';
import type { G } from '../lib/bookgraphs';
import { Player, useStepper } from '../engine/stepper';

const RULES: [Rule, string][] = [['dfs', 'أي مسار (بحث بالعمق)'], ['bfs', 'الأقصر (Edmonds–Karp)'], ['fat', 'الأسمن (Edmonds–Karp)']];

/** Ford–Fulkerson step by step, in G (flow/capacity) or in the residual graph G_f. */
export default function AugmentLab({ rule: r0 = 'dfs', rules = true }: { rule?: Rule; rules?: boolean }) {
  const net = FLOW_NET, nm = net.names;
  const [rule, setRule] = useState<Rule>(r0);
  const [view, setView] = useState<'g' | 'res'>('res');
  const frames = useMemo(() => fordFulkersonFrames(net, rule), [net, rule]);
  const s = useStepper<FFrame>(frames, 1);
  const f = s.frame, done = !f.path;
  const arcs = residualArcs(net, f.f);
  const resG: G = { names: nm, xy: net.xy, edges: arcs.map((a) => [a.u, a.v, a.r]) };
  const onPath = (u: number, v: number) => !!f.path?.some((a) => a.u === u && a.v === v);
  const onPathEdge = (k: number) => !!f.path?.some((a) => a.k === k);
  const idx = (u: number, v: number) => net.edges.findIndex(([a, b]) => a === u && b === v);
  const S = new Set(f.S ?? []);
  const pathTxt = f.path ? [nm[0], ...f.path.map((a) => nm[a.v])].join('→') : '';
  return (
    <div className="widget card au">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">مسارات التحسين وFord–Fulkerson</span></div>
      {rules && <div className="rel-tabs">{RULES.map(([k, l]) => <button key={k} className={`pr-tab ${rule === k ? 'on' : ''}`} onClick={() => setRule(k)}>{l}</button>)}</div>}
      <div className="rel-tabs">
        <button className={`pr-tab ${view === 'res' ? 'on' : ''}`} onClick={() => setView('res')}>الرسم المتبقي <bdi dir="ltr">G<sub>f</sub></bdi></button>
        <button className={`pr-tab ${view === 'g' ? 'on' : ''}`} onClick={() => setView('g')}>التدفق في G</button>
      </div>
      {view === 'res' ? (
        <GraphSvg g={resG} st={{ directed: true, scale: 70, r: 15, weights: true,
          vClass: (v) => (done ? (S.has(v) ? 'c1' : 'c3') : ''), eClass: (u, v) => (onPath(u, v) ? 'hot' : '') }} />
      ) : (
        <GraphSvg g={net} st={{ directed: true, scale: 70, r: 15,
          eLabel: (u, v) => { const k = idx(u, v); return `${f.f[k]}/${cap(net, k)}`; },
          vClass: (v) => (done ? (S.has(v) ? 'c1' : 'c3') : ''),
          eClass: (u, v) => { const k = idx(u, v); return onPathEdge(k) ? 'hot' : f.f[k] === cap(net, k) ? 'tree' : f.f[k] > 0 ? 'cross' : ''; } }} />
      )}
      <div className="edl-msg">
        {done ? <>لا مسار من s إلى t في <bdi dir="ltr">G<sub>f</sub></bdi>: التدفق أكبر تدفق، قيمته <b className="ltr">{f.value}</b>. والرؤوس الخضراء (ما يصل إليه s في <bdi dir="ltr">G<sub>f</sub></bdi>) هي S في قطع أصغر سعته {f.value} أيضًا.</>
          : <>مسار تحسين <bdi dir="ltr">{pathTxt}</bdi>، وعنق الزجاجة <bdi dir="ltr">F = {f.F}</bdi>. {f.path!.some((a) => a.dir < 0) ? 'فيه حافة معكوسة: ندفع التدفق «إلى الوراء» عليها، أي نلغي تدفقًا قديمًا.' : ''}</>}
      </div>
      <div className="da-stats">
        <span>التكرار: <b className="ltr">{f.iter + (done ? 0 : 1)}</b> من {frames.length - 1}</span>
        <span><bdi dir="ltr">|f| = {f.value}{!done && <> → {f.value + f.F}</>}</bdi></span>
      </div>
      <Player s={s} />
    </div>
  );
}

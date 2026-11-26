import { useMemo } from 'react';
import GraphSvg from './GraphSvg';
import { DAG_G, longestFrames, type LFrame } from '../lib/dfs';
import { Player, useStepper } from '../engine/stepper';

/** Memoized LongestPath(s, t) on a dag: the recursion is a depth-first search, the values finish in postorder. */
export default function LongestPathLab() {
  const g = DAG_G, s0 = 0, t = g.names.length - 1;
  const frames = useMemo(() => longestFrames(g, s0, t), [g]);
  const s = useStepper<LFrame>(frames, 2);
  const f = s.frame, nm = (x: number) => g.names[x];
  const fmt = (x: number | null) => (x === null ? null : x === -Infinity ? '−∞' : String(x));
  // the optimal path, once known
  const path = new Set<string>();
  if (f.phase === 'done') { let v = s0; while (v !== t && f.best[v] !== null) { path.add(`${v},${f.best[v]}`); v = f.best[v]!; } }
  const msg = (() => {
    if (f.phase === 'call') return <>أول زيارة لـ {nm(f.cur)}: نعلّمه ونضع <bdi dir="ltr">LLP({nm(f.cur)}) = −∞</bdi>، ثم نمر على حوافه الخارجة.</>;
    if (f.phase === 'edge' && f.edge) { const [v, w] = f.edge; const wt = g.edges.find(([a, b]) => a === v && b === w)![2]; return <>الحافة <bdi dir="ltr">{nm(v)}→{nm(w)}</bdi> وزنها {wt}، و<bdi dir="ltr">LLP({nm(w)}) = {fmt(f.llp[w])}</bdi>. أفضل قيمة لـ {nm(v)} حتى الآن: <bdi dir="ltr">{fmt(f.llp[v])}</bdi>.</>; }
    if (f.phase === 'ret') return <>انتهى {nm(f.cur)}: <bdi dir="ltr">LLP({nm(f.cur)}) = {fmt(f.llp[f.cur])}</bdi> نهائية. وأي استدعاء لاحق يعيدها من الذاكرة.</>;
    return <>أطول مسار من s إلى t طوله <b className="ltr">{fmt(f.llp[s0])}</b> (الحواف الكهرمانية). وترتيب انتهاء الرؤوس ترتيب بعدي للرسم.</>;
  })();
  return (
    <div className="widget card lp">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أطول مسار في dag بالحفظ</span>
      </div>
      <div className="vm-help">الرقم الأحمر فوق كل رأس قيمة <bdi dir="ltr">LLP(v)</bdi>: طول أطول مسار منه إلى t. والأرقام على الحواف أوزانها.</div>
      <GraphSvg g={g} st={{
        directed: true, scale: 66, r: 14, weights: true,
        vClass: (v) => `${f.marked[v] ? (f.order.includes(v) ? 'st-done' : 'st-active') : ''} ${v === f.cur ? 'cur' : ''}`,
        eClass: (u, v) => (path.has(`${u},${v}`) ? 'hot' : f.edge && f.edge[0] === u && f.edge[1] === v ? 'hot' : f.marked[u] && f.order.includes(u) && f.best[u] === v ? 'tree' : ''),
        label: (v) => fmt(f.llp[v]),
      }} />
      <div className="df-order" dir="ltr"><span className="lbl">finished (postorder):</span>{f.order.map((v) => <span key={v} className="v">{nm(v)}</span>)}</div>
      <div className="edl-msg">{msg}</div>
      <Player s={s} />
    </div>
  );
}

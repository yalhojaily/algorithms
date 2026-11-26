import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import type { G } from '../lib/bookgraphs';
import { BFS_G, DAG_NEG, NEGCYC_G, NEG_G, POS_G, bellmanFordFrames, bfsFrames, dagFrames, dijkstraFrames, mooreFrames, type SFrame } from '../lib/sssp';
import { Player, useStepper } from '../engine/stepper';

type Algo = 'bfs' | 'dag' | 'dijkstra' | 'bellman' | 'moore';
const OPTIONS: Record<Algo, { g: G; label: string }[]> = {
  bfs: [{ g: BFS_G, label: 'أوزان 1' }],
  dag: [{ g: DAG_NEG, label: 'dag بحواف سالبة' }],
  dijkstra: [{ g: POS_G, label: 'أوزان موجبة' }, { g: NEG_G, label: 'حواف سالبة' }],
  bellman: [{ g: NEG_G, label: 'حواف سالبة' }, { g: NEGCYC_G, label: 'دورة سالبة' }],
  moore: [{ g: NEG_G, label: 'حواف سالبة' }, { g: NEGCYC_G, label: 'دورة سالبة' }],
};
const RUN: Record<Algo, (g: G, s: number) => SFrame[]> = { bfs: bfsFrames, dag: dagFrames, dijkstra: dijkstraFrames, bellman: bellmanFordFrames, moore: mooreFrames };
const fmt = (x: number) => (x === Infinity ? '∞' : String(x));

/** One shortest-path algorithm, step by step: distances above vertices, pred edges in red. */
export default function SSSPLab({ algo }: { algo: Algo }) {
  const [gi, setGi] = useState(0);
  const { g } = OPTIONS[algo][gi];
  const frames = useMemo(() => RUN[algo](g, 0), [algo, g]);
  const s = useStepper<SFrame>(frames, algo === 'bellman' ? 4 : 2);
  const f = s.frame, nm = (x: number) => g.names[x];
  const e = f.edge >= 0 ? g.edges[f.edge] : null;
  const qName = algo === 'dijkstra' ? 'priority queue' : algo === 'dag' ? 'topological order' : algo === 'bellman' ? '' : 'queue';
  const msg = (() => {
    if (f.msg === 'init') return <><bdi dir="ltr">dist(s) = 0</bdi>، وكل ما سواه ∞.{algo === 'dag' ? ' ونرتب الرؤوس طوبولوجيًا.' : ''}</>;
    if (f.msg === 'token') return <>خرج الرمز ✠ من الطابور: انتهت المرحلة {f.phase - 1}، ونعيده إلى آخر الطابور.</>;
    if (f.msg === 'pull') return algo === 'dijkstra' ? <>ExtractMin: {nm(f.cur)} بمسافة {fmt(f.dist[f.cur])}{f.extracted![f.cur] > 1 ? <b> (للمرة {f.extracted![f.cur]}!)</b> : ''}.</> : <>نمسح {nm(f.cur)}، ونفحص حوافه الخارجة.</>;
    if (f.msg === 'edge' && e) return <>الحافة <bdi dir="ltr">{nm(e[0])}→{nm(e[1])}</bdi> ({e[2]}): {f.relaxed ? <><b>مشدودة</b>، نرخيها: <bdi dir="ltr">dist({nm(e[1])}) = {fmt(f.dist[e[1]])}</bdi>.</> : 'ليست مشدودة.'}</>;
    if (f.msg === 'round') return <>انتهت الجولة {f.phase} على كل الحواف.</>;
    if (f.msg === 'negcycle') return <><b>دورة سالبة!</b> {algo === 'bellman' ? <>بعد V − 1 جولات ما زالت حافة مشدودة.</> : <>بعد V − 1 مراحل ما زال الطابور غير فارغ.</>}</>;
    return <>انتهى: كل المسافات صحيحة، وحواف pred شجرة أقصر المسارات.</>;
  })();
  return (
    <div className="widget card ss">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">{({ bfs: 'البحث بالعرض بمراحل', dag: 'أقصر المسارات في dag', dijkstra: 'Dijkstra', bellman: 'Bellman-Ford', moore: 'Moore: Bellman-Ford بطابور' } as const)[algo]}</span>
      </div>
      {OPTIONS[algo].length > 1 && (
        <div className="rel-tabs">
          {OPTIONS[algo].map((o, i) => <button key={i} className={`pr-tab ${gi === i ? 'on' : ''}`} onClick={() => setGi(i)}>{o.label}</button>)}
        </div>
      )}
      <GraphSvg g={g} st={{ directed: true, scale: 66, r: 15, weights: algo !== 'bfs',
        vClass: (v) => `${v === f.cur ? 'cur' : ''} ${f.queue.includes(v) ? 'st-active' : f.dist[v] < Infinity ? 'c2' : ''}`,
        eClass: (u, v) => (e && e[0] === u && e[1] === v ? (f.relaxed ? 'hot' : 'cross') : f.pred[v] === u ? 'tree' : ''),
        label: (v) => fmt(f.dist[v]),
      }} />
      {qName && (
        <div className="df-order" dir="ltr"><span className="lbl">{qName}:</span>
          {f.queue.length ? f.queue.map((x, i) => <span key={i} className={`v ${x === '|' ? '' : 'on'}`}>{x === '|' ? '✠' : `${nm(x)}${algo === 'dijkstra' ? ':' + fmt(f.dist[x]) : ''}`}</span>) : <span className="lbl">—</span>}
        </div>
      )}
      <div className="edl-msg">{msg}</div>
      <div className="da-stats">
        <span>إرخاءات: <b className="ltr">{f.relaxCount}</b></span>
        {(algo === 'bfs' || algo === 'moore') && <span>المرحلة: <b className="ltr">{f.phase}</b></span>}
        {algo === 'bellman' && <span>الجولة: <b className="ltr">{f.phase}</b> من {g.names.length - 1}</span>}
        {algo === 'dijkstra' && <span>استخراجات: <bdi dir="ltr">{g.names.map((c, v) => `${c}:${f.extracted![v]}`).join(' ')}</bdi></span>}
      </div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { DIR_G, kosarajuFrames, reverseG, tarjanFrames, type KFrame, type TFrame } from '../lib/dfs';
import { Player, useStepper } from '../engine/stepper';

type Algo = 'ks' | 'tarjan';

/** Colour class for a component, by the order its root was found. */
const colorer = (root: number[]) => {
  const seen: number[] = [];
  return (v: number) => {
    if (root[v] < 0) return '';
    let k = seen.indexOf(root[v]);
    if (k < 0) { seen.push(root[v]); k = seen.length - 1; }
    return `c${(k % 5) + 1}`;
  };
};

function Condensed({ root }: { root: number[] }) {
  const g = DIR_G, roots = [...new Set(root)].filter((r) => r >= 0);
  const comp = (r: number) => g.names.filter((_, v) => root[v] === r).join('');
  const arcs = new Set<string>();
  for (const [u, v] of g.edges) if (root[u] !== root[v]) arcs.add(`{${comp(root[u])}} → {${comp(root[v])}}`);
  return (
    <div className="df-order" dir="ltr">
      <span className="lbl">scc(G):</span>{roots.map((r) => <span key={r} className="v">{`{${comp(r)}}`}</span>)}
      <span className="lbl">edges:</span>{[...arcs].map((a) => <span key={a} className="v">{a}</span>)}
    </div>
  );
}

function KS() {
  const frames = useMemo(() => kosarajuFrames(DIR_G), []);
  const s = useStepper<KFrame>(frames, 3);
  const f = s.frame, nm = (x: number) => DIR_G.names[x];
  const g = f.phase === 1 ? reverseG(DIR_G) : DIR_G, col = colorer(f.root);
  const msg = f.phase === 1
    ? <>المرحلة 1: بحث بالعمق في <b>المعكوس</b> <bdi dir="ltr">rev(G)</bdi> (الأسهم مقلوبة). كل رأس ينتهي يُدفع إلى المكدس S.{f.cur >= 0 && <> الآن: {nm(f.cur)}.</>}</>
    : f.phase === 2
      ? <>المرحلة 2: نُخرج من S بالترتيب، وكل رأس بلا جذر يبدأ بحثًا في <b>G الأصلي</b> يلوّن كل ما يصل إليه ولم يُلوّن. كل بحث يزور مكونًا قويًا واحدًا بالضبط.</>
      : <>انتهى: <b>{f.count}</b> مكونات قوية. أول رأس في S كان في مكون مصرف (sink) في G، ولهذا لم يتسرب البحث الأول خارج مكونه.</>;
  return (
    <>
      <GraphSvg g={g} st={{ directed: true, scale: 64, r: 14,
        vClass: (v) => `${col(v) || (f.marked[v] && f.phase === 1 ? (f.stack.includes(v) ? 'st-done' : 'st-active') : '')} ${v === f.cur ? 'cur' : ''}`,
        eClass: (u, v) => (f.edge && f.edge[0] === u && f.edge[1] === v ? 'hot' : f.phase >= 2 && f.root[u] >= 0 && f.root[u] !== f.root[v] && f.root[v] >= 0 ? 'dim' : ''),
      }} />
      <div className="df-order" dir="ltr"><span className="lbl">S (top →):</span>{f.stack.length ? f.stack.map((v) => <span key={v} className="v">{nm(v)}</span>) : <span className="lbl">—</span>}</div>
      {f.phase === 3 && <Condensed root={f.root} />}
      <div className="edl-msg">{msg}</div>
      <Player s={s} />
    </>
  );
}

function Tarjan() {
  const frames = useMemo(() => tarjanFrames(DIR_G), []);
  const s = useStepper<TFrame>(frames, 3);
  const f = s.frame, nm = (x: number) => DIR_G.names[x], col = colorer(f.root);
  const e = f.edge;
  const msg = (() => {
    if (f.msg === 'start') return <>نبدأ {nm(f.cur)}: <bdi dir="ltr">pre = low = {f.pre[f.cur]}</bdi>، ونضعه على المكدس S.</>;
    if (f.msg === 'tree' && e) return <>{nm(e[1])} جديد: نستدعي البحث فيه.</>;
    if (f.msg === 'ret' && e) return <>رجعنا من {nm(e[1])}: <bdi dir="ltr">low({nm(e[0])}) = min(low({nm(e[0])}), low({nm(e[1])})) = {f.low[e[0]]}</bdi>.</>;
    if (f.msg === 'other' && e) return <>{nm(e[1])} زير ولم يُسند إلى مكون: <bdi dir="ltr">low({nm(e[0])}) = min(…, pre({nm(e[1])})) = {f.low[e[0]]}</bdi>.</>;
    if (f.msg === 'skip' && e) return <>{nm(e[1])} في مكون منتهٍ: نتجاهل الحافة كأنه حُذف.</>;
    if (f.msg === 'pop') return <><bdi dir="ltr">low({nm(f.cur)}) = pre({nm(f.cur)})</bdi>: {nm(f.cur)} جذر مكون مصرف. نُخرج من S حتى {nm(f.cur)}، وهذا هو المكون.</>;
    return <>انتهى في بحث واحد: كل مكون خرج من المكدس دفعة واحدة، والمكونات خرجت بترتيب طوبولوجي معكوس لـ <bdi dir="ltr">scc(G)</bdi>.</>;
  })();
  return (
    <>
      <GraphSvg g={DIR_G} st={{ directed: true, scale: 64, r: 14,
        vClass: (v) => `${col(v) || (f.pre[v] ? (f.rec.includes(v) ? 'st-active' : 'st-done') : '')} ${v === f.cur ? 'cur' : ''}`,
        eClass: (u, v) => (e && e[0] === u && e[1] === v ? 'hot' : ''),
        label: (v) => (f.pre[v] ? `${f.pre[v]}·${f.low[v]}` : null),
      }} />
      <div className="vm-help">فوق كل رأس: <bdi dir="ltr">pre·low</bdi>.</div>
      <div className="df-order" dir="ltr"><span className="lbl">S (top →):</span>{f.S.length ? f.S.map((v) => <span key={v} className="v on">{nm(v)}</span>) : <span className="lbl">—</span>}</div>
      {f.msg === 'done' && <Condensed root={f.root} />}
      <div className="edl-msg">{msg}</div>
      <Player s={s} />
    </>
  );
}

export default function SCCLab({ algo: a0 = 'ks' }: { algo?: Algo }) {
  const [algo, setAlgo] = useState<Algo>(a0);
  return (
    <div className="widget card scc">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">المكونات القوية في زمن خطي</span>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${algo === 'ks' ? 'on' : ''}`} onClick={() => setAlgo('ks')}>Kosaraju–Sharir</button>
        <button className={`pr-tab ${algo === 'tarjan' ? 'on' : ''}`} onClick={() => setAlgo('tarjan')}>Tarjan</button>
      </div>
      {algo === 'ks' ? <KS /> : <Tarjan />}
    </div>
  );
}

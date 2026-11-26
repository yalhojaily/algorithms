import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { WEIGHTED } from '../lib/bookgraphs';
import { boruvkaFrames, jarnikFrames, kruskalFrames, type MFrame } from '../lib/mst';
import { Player, useStepper } from '../engine/stepper';

type Algo = 'boruvka' | 'jarnik' | 'kruskal';
const LABEL: Record<Algo, string> = { boruvka: 'Borůvka', jarnik: 'Jarník («Prim»)', kruskal: 'Kruskal' };

/** The three classical MST algorithms on the same graph: F in red, useless edges dashed, safe edges green. */
export default function MSTAlgoLab({ algo: a0 = 'boruvka' }: { algo?: Algo }) {
  const g = WEIGHTED;
  const [algo, setAlgo] = useState<Algo>(a0);
  const frames = useMemo(() => (algo === 'boruvka' ? boruvkaFrames(g) : algo === 'jarnik' ? jarnikFrames(g, 0) : kruskalFrames(g)), [algo, g]);
  const s = useStepper<MFrame>(frames, 1);
  const f = s.frame;
  const idx = (u: number, v: number) => g.edges.findIndex(([a, b]) => a === u && b === v);
  const F = new Set(f.F), U = new Set(f.useless), SAFE = new Set(f.safe);
  const nm = (k: number) => `${g.names[g.edges[k][0]]}${g.names[g.edges[k][1]]}`;
  const wt = (k: number) => g.edges[k][2]!;
  const total = f.F.reduce((a, k) => a + wt(k), 0);
  const comps = Math.max(...f.comp);
  const sorted = useMemo(() => g.edges.map((_, k) => k).sort((a, b) => wt(a) - wt(b)), [g]);
  const msg = (() => {
    if (f.phase === 'done') return <>انتهى: الشجرة الصغرى وزنها <b className="ltr">{total}</b>. وكل الحواف الأخرى صارت عديمة الفائدة.</>;
    if (algo === 'boruvka') {
      if (f.phase === 'safe') return <>الجولة {f.round}: لكل مكون من المكونات {comps}، أخف حافة تخرج منه آمنة. نضيفها <b>كلها</b>: <bdi dir="ltr">{f.safe.map(nm).join(', ')}</bdi>.</>;
      return <>بعد الجولة {f.round}: {comps} {comps === 1 ? 'مكون' : 'مكونات'}. (الحافة قد تكون آمنة لمكونين معًا، فتُضاف مرة واحدة.)</>;
    }
    if (algo === 'jarnik') {
      if (f.phase === 'start') return <>الشجرة T رأس واحد: s. وكل حوافه في طابور الأولويات.</>;
      if (f.phase === 'useless') return <>أخرجنا <bdi dir="ltr">{nm(f.cur)} ({wt(f.cur)})</bdi>: طرفاها في T، فهي عديمة الفائدة. نرميها.</>;
      if (f.phase === 'safe') return <>أخرجنا <bdi dir="ltr">{nm(f.cur)} ({wt(f.cur)})</bdi>: أخف حافة لها طرف واحد في T، أي حافة T الآمنة.</>;
      return <>أضفناها، والرأس الجديد أدخل حوافه إلى الطابور.</>;
    }
    if (f.phase === 'start') return <>نرتب الحواف تصاعديًا بالوزن، ونمر عليها بالترتيب.</>;
    if (f.phase === 'safe') return <><bdi dir="ltr">{nm(f.cur)} ({wt(f.cur)})</bdi> تصل مكونين مختلفين، فهي آمنة: نضيفها.</>;
    return <><bdi dir="ltr">{nm(f.cur)} ({wt(f.cur)})</bdi> طرفاها في مكون واحد: عديمة الفائدة.</>;
  })();
  return (
    <div className="widget card ma">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ثلاث خوارزميات، شجرة واحدة</span>
      </div>
      <div className="rel-tabs">
        {(Object.keys(LABEL) as Algo[]).map((a) => <button key={a} className={`pr-tab ${algo === a ? 'on' : ''}`} onClick={() => setAlgo(a)}>{LABEL[a]}</button>)}
      </div>
      <GraphSvg g={g} st={{ scale: 70, r: 14, weights: true,
        vClass: (v) => (comps > 1 || f.phase === 'done' ? `c${((f.comp[v] - 1) % 5) + 1}` : 'c1'),
        eClass: (u, v) => { const k = idx(u, v); return SAFE.has(k) && !F.has(k) ? 'safe' : F.has(k) ? 'tree' : k === f.cur ? 'hot' : U.has(k) ? 'useless' : ''; },
      }} />
      {algo === 'kruskal' && (
        <div className="ms-list" dir="ltr"><span className="lbl">sorted:</span>
          {sorted.map((k) => <span key={k} className={`${F.has(k) ? 'in' : U.has(k) && sorted.indexOf(k) <= sorted.indexOf(f.cur) ? 'no' : ''} ${k === f.cur ? 'on' : ''}`}>{nm(k)}:{wt(k)}</span>)}
        </div>
      )}
      {algo === 'jarnik' && (
        <div className="ms-list" dir="ltr"><span className="lbl">priority queue:</span>
          {(f.pq ?? []).map((x, i) => <span key={i} className={U.has(x.k) ? 'no' : ''}>{nm(x.k)}:{x.w}</span>)}
        </div>
      )}
      <div className="edl-msg">{msg}</div>
      <div className="da-stats">
        <span>حواف F: <b className="ltr">{f.F.length}</b> من {g.names.length - 1}</span>
        <span>المكونات: <b className="ltr">{comps}</b></span>
        <span>وزن F: <b className="ltr">{total}</b></span>
        {algo === 'boruvka' && <span>الجولة: <b className="ltr">{f.round ?? 0}</b></span>}
      </div>
      <div className="vm-help">الأحمر في F، والأخضر آمن يُضاف الآن، والمنقّط عديم الفائدة. ولون الرأس مكونه في F.</div>
      <Player s={s} />
    </div>
  );
}

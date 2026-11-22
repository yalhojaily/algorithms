import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { BOOK_G, WEIGHTED, gridG, wfsFrames, type Bag, type G, type WFrame } from '../lib/bookgraphs';
import { Player, useStepper } from '../engine/stepper';

type GName = 'book' | 'grid' | 'weighted';
const GRAPHS: Record<GName, { g: G; s: number; label: string }> = {
  book: { g: BOOK_G, s: 0, label: 'رسم الكتاب (13 رأسًا)' },
  grid: { g: gridG(5, 7), s: 17, label: 'شبكة 5×7' },
  weighted: { g: WEIGHTED, s: 0, label: 'رسم موزون' },
};
const BAGS: [Bag, string][] = [['stack', 'مكدس: بالعمق'], ['queue', 'طابور: بالعرض'], ['prim', 'أولويات بالوزن: Prim'], ['dijkstra', 'أولويات بالمسافة: Dijkstra']];

/** WhateverFirstSearch, step by step: the bag holds pairs (parent, vertex); the parent edges form the tree. */
export default function WFSLab({ bag: bag0 = 'stack', graph: g0 = 'book', all: all0 = false }: { bag?: Bag; graph?: GName; all?: boolean }) {
  const [gn, setGn] = useState<GName>(g0);
  const [bag, setBag] = useState<Bag>(bag0);
  const [all, setAll] = useState(all0);
  const { g, s: s0 } = GRAPHS[gn];
  const frames = useMemo(() => wfsFrames(g, s0, bag, all), [g, s0, bag, all]);
  const s = useStepper<WFrame>(frames, gn === 'grid' ? 6 : 3);
  const f = s.frame, nm = (x: number) => (x < 0 ? '∅' : g.names[x]);
  const isTree = (a: number, b: number) => f.parent[b] === a || f.parent[a] === b;
  const inBag = new Set(f.bag.map((x) => x.v));
  const pq = bag === 'prim' || bag === 'dijkstra';
  const order = (v: number) => f.marked.indexOf(v);
  const msg = (() => {
    switch (f.phase) {
      case 'start': return <>نضع <bdi dir="ltr">(∅, {nm(f.v)})</bdi> في الحقيبة.</>;
      case 'newcomp': return <>انتهى مكون. أول رأس غير معلَّم في القائمة هو {nm(f.v)}: نبدأ منه المكون رقم {f.count}.</>;
      case 'take': return <>نأخذ <bdi dir="ltr">({nm(f.p)}, {nm(f.v)})</bdi> من الحقيبة{pq ? ' (صاحب أصغر أولوية)' : bag === 'stack' ? ' (آخر ما دخل)' : ' (أقدم ما دخل)'}.</>;
      case 'skip': return <>{nm(f.v)} معلَّم من قبل: نرميه ولا نفعل شيئًا.</>;
      case 'mark': return <>{nm(f.v)} غير معلَّم: نعلّمه، وأبوه <bdi dir="ltr">parent({nm(f.v)}) = {nm(f.p)}</bdi>{bag === 'dijkstra' ? <>، ومسافته <bdi dir="ltr">{f.dist[f.v]}</bdi></> : ''}.</>;
      case 'put': return <>نضع كل جيران {nm(f.v)} في الحقيبة، كل واحد مع {nm(f.v)} أبًا مرشحًا، حتى المعلَّمين منهم.</>;
      default: return <>فرغت الحقيبة. الحواف الحمراء شجرة تغطية {all ? `لكل مكون (${f.count} مكونات): غابة تغطية` : 'لمكون البداية'}.</>;
    }
  })();
  const takes = frames.slice(0, s.i + 1).filter((x) => x.phase === 'take').length;
  const skips = frames.slice(0, s.i + 1).filter((x) => x.phase === 'skip').length;
  return (
    <div className="widget card wf">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">البحث أيًا كان أولًا</span>
      </div>
      <div className="rel-tabs wf-tabs">
        {BAGS.map(([b, l]) => <button key={b} className={`pr-tab ${bag === b ? 'on' : ''}`} onClick={() => setBag(b)}>{l}</button>)}
      </div>
      <div className="rel-tabs wf-tabs">
        {(Object.keys(GRAPHS) as GName[]).map((k) => <button key={k} className={`pr-tab ${gn === k ? 'on' : ''}`} onClick={() => setGn(k)}>{GRAPHS[k].label}</button>)}
        <label className="wf-all"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> كل المكونات (WFSAll)</label>
      </div>
      <GraphSvg g={g} st={{
        scale: gn === 'grid' ? 50 : 60, r: gn === 'grid' ? 11 : 13, weights: gn === 'weighted',
        vClass: (v) => `${f.comp[v] ? `c${((f.comp[v] - 1) % 5) + 1}` : ''} ${v === f.v ? 'cur' : ''} ${!f.comp[v] && inBag.has(v) ? 'bagged' : ''}`,
        eClass: (a, b) => (isTree(a, b) && f.comp[a] && f.comp[b] ? 'tree' : (f.p === a && f.v === b) || (f.p === b && f.v === a) ? 'hot' : ''),
        label: (v) => (f.comp[v] ? (bag === 'dijkstra' ? String(f.dist[v]) : gn === 'grid' ? null : String(order(v) + 1)) : null),
      }} />
      <div className="wf-bag" dir="ltr">
        <span className="wf-bl">{bag === 'stack' ? 'stack (top →)' : bag === 'queue' ? '← front  queue' : 'priority queue'}</span>
        {f.bag.length === 0 && <span className="wf-empty">empty</span>}
        {(pq ? [...f.bag].sort((a, b) => a.key - b.key) : f.bag).slice(0, 40).map((x, k) => (
          <span key={k} className={`wf-item ${f.comp[x.v] ? 'old' : ''}`}>{nm(x.p)},{nm(x.v)}{pq && <small>{x.key}</small>}</span>
        ))}
        {f.bag.length > 40 && <span className="wf-empty">… +{f.bag.length - 40}</span>}
      </div>
      <div className="edl-msg">{msg}</div>
      <div className="da-stats">
        <span>معلَّم: <b className="ltr">{f.marked.length}</b> من {g.names.length}</span>
        <span>في الحقيبة: <b className="ltr">{f.bag.length}</b></span>
        <span>أُخذ من الحقيبة: <b className="ltr">{takes}</b> (رُمي منها {skips})</span>
        <span>حدّ الأخذ: <bdi dir="ltr">2E + {all ? 'c' : '1'} = {2 * g.edges.length + (all ? f.count || 1 : 1)}</bdi></span>
      </div>
      <div className="vm-help">الرأس المنقّط في الحقيبة ولم يُعلَّم بعد. الرقم فوق الرأس ترتيب تعليمه{bag === 'dijkstra' ? '، ومع Dijkstra مسافته من البداية' : ''}. الأزواج الباهتة في الحقيبة أزواج سيُرمى رأسها لأنه معلَّم.</div>
      <Player s={s} />
    </div>
  );
}

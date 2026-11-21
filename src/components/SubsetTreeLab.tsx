import { useMemo, useState } from 'react';
import { subsetTree, type SNode } from '../lib/subsetsum';
import { Player, useStepper } from '../engine/stepper';

const PRESETS: { X: number[]; T: number }[] = [
  { X: [3, 5, 7, 8], T: 15 },
  { X: [8, 6, 7, 5, 3], T: 15 },
  { X: [2, 4, 6, 8], T: 7 },
  { X: [1, 2, 3, 4, 5], T: 100 },
];

/** The recursion tree of SubsetSum(X, i, T): left edge = with X[i], right edge = without. */
export default function SubsetTreeLab() {
  const [p, setP] = useState(0);
  const [sc, setSc] = useState(false);
  const { X, T } = PRESETS[p];
  const { root, count } = useMemo(() => subsetTree(X, T, sc), [X, T, sc]);
  const nodes: (SNode & { x: number; px?: number; py?: number })[] = [];
  let leaf = 0;
  const walk = (v: SNode, px?: number, py?: number): number => {
    const me = { ...v, x: 0, px, py };
    nodes.push(me);
    if (!v.children.length) { me.x = leaf++; return me.x; }
    const xs = v.children.map((c) => walk(c, undefined, v.depth));
    me.x = (xs[0] + xs[xs.length - 1]) / 2;
    return me.x;
  };
  walk(root);
  const order = [...nodes].sort((a, b) => a.order - b.order);
  const s = useStepper<number>(order.map((_, k) => k), 4);
  const k = s.frame;
  const byId = new Map(nodes.map((v) => [v.id, v]));
  const parent = new Map<number, number>();
  for (const v of nodes) for (const c of v.children) parent.set(c.id, v.id);
  const depth = Math.max(...nodes.map((v) => v.depth));
  const W = Math.max(360, leaf * 34), H = (depth + 1) * 62 + 20;
  const X0 = (x: number) => 20 + (x + 0.5) * ((W - 40) / leaf);
  const Y0 = (d: number) => 24 + d * 62;
  const cur = order[k];
  return (
    <div className="widget card sst">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">شجرة استدعاء SubsetSum</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((q, i) => <button key={i} className={`tt-preset ${i === p ? 'on' : ''}`} onClick={() => setP(i)}><bdi dir="ltr">X = {`{${q.X.join(', ')}}`}, T = {q.T}</bdi></button>)}
        <label className="qn-chk"><input type="checkbox" checked={sc} onChange={(e) => setSc(e.target.checked)} /> توقّف عن الاستدعاء الثاني إن نجح الأول</label>
      </div>
      <div className="sst-wrap">
        <svg className="sst-svg" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 640) }} direction="ltr">
          {nodes.filter((v) => parent.has(v.id)).map((v) => {
            const pa = byId.get(parent.get(v.id)!)!;
            const seen = v.order <= cur.order;
            return (
              <g key={`e${v.id}`} className={seen ? '' : 'sst-ghost'}>
                <line x1={X0(pa.x)} y1={Y0(pa.depth) + 14} x2={X0(v.x)} y2={Y0(v.depth) - 14} className={`sst-e ${v.edge}`} />
                <text x={(X0(pa.x) + X0(v.x)) / 2 + (v.edge === 'with' ? -8 : 8)} y={(Y0(pa.depth) + Y0(v.depth)) / 2} className="sst-el" textAnchor="middle">{v.edge === 'with' ? `+${X[pa.i - 1]}` : '✗'}</text>
              </g>
            );
          })}
          {nodes.map((v) => {
            const seen = v.order <= cur.order;
            const done = seen && v.value !== null;
            return (
              <g key={v.id} className={`sst-n ${seen ? '' : 'sst-ghost'} ${v.id === cur.id ? 'cur' : ''} ${done ? (v.value ? 't' : 'f') : ''}`}>
                <rect x={X0(v.x) - 15} y={Y0(v.depth) - 14} width={30} height={28} rx={7} />
                <text x={X0(v.x)} y={Y0(v.depth) - 1} textAnchor="middle" className="sst-t">{v.T}</text>
                <text x={X0(v.x)} y={Y0(v.depth) + 10} textAnchor="middle" className="sst-i">i={v.i}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="da-stats">
        <span>الاستدعاء الحالي: <bdi dir="ltr">SubsetSum(X, {cur.i}, {cur.T})</bdi></span>
        <span>الاستدعاءات: <b className="ltr">{k + 1}</b> من <b className="ltr">{count}</b> · الحد الأعلى <bdi dir="ltr">2<sup>{X.length + 1}</sup> − 1 = {2 ** (X.length + 1) - 1}</bdi></span>
        <span>الجواب: <b>{root.value ? 'True' : 'False'}</b></span>
      </div>
      <div className="vm-help">في كل عقدة: الرقم الكبير هو الهدف المتبقي T، وi عدد العناصر التي لم نقرر فيها بعد. الفرع الأيسر يأخذ <bdi dir="ltr">X[i]</bdi> فيطرحه من الهدف، والأيمن يتركه. العقد الخضراء أعادت True، والحمراء False. وقارن مع المثال الأخير: الهدف أكبر من مجموع العناصر، فتصبح الشجرة كاملة.</div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { circleXY, componentsOf, graphKind, type G } from '../lib/bookgraphs';

const N = 8;
const NAMES = 'abcdefgh'.split('');
const START: [number, number][] = [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [6, 7]];

/** Click two vertices to add or remove the edge between them; the counts and the kind of graph update. */
export default function GraphTermsLab() {
  const [edges, setEdges] = useState<[number, number][]>(START);
  const [pick, setPick] = useState<number | null>(null);
  const g: G = useMemo(() => ({ names: NAMES, xy: circleXY(N), edges }), [edges]);
  const comp = useMemo(() => componentsOf(N, edges), [edges]);
  const k = graphKind(N, edges);
  const deg = NAMES.map((_, v) => edges.filter(([a, b]) => a === v || b === v).length);
  const maxE = (N * (N - 1)) / 2;
  const click = (v: number) => {
    if (pick === null) return setPick(v);
    if (pick === v) return setPick(null);
    const [a, b] = pick < v ? [pick, v] : [v, pick];
    setEdges(edges.some(([x, y]) => x === a && y === b) ? edges.filter(([x, y]) => !(x === a && y === b)) : [...edges, [a, b]]);
    setPick(null);
  };
  const rnd = () => {
    const e: [number, number][] = [];
    for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) if (Math.random() < 0.22) e.push([a, b]);
    setEdges(e); setPick(null);
  };
  const kind = k.tree ? 'شجرة (tree): متصل وبلا دورات' : k.forest ? `غابة (forest) من ${k.c} أشجار: بلا دورات، وغير متصل` : k.connected ? 'متصل، وفيه دورة' : `غير متصل (${k.c} مكونات)، وفيه دورة`;
  return (
    <div className="widget card gt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ارسم رسمًا واقرأ خصائصه</span>
      </div>
      <div className="vm-help">انقر رأسين لتضيف الحافة بينهما، أو لتحذفها إن كانت موجودة. الألوان تميز المكونات (components).</div>
      <GraphSvg g={g} st={{ onClick: click, scale: 62, vClass: (v) => `c${((comp[v] - 1) % 5) + 1} ${pick === v ? 'sel' : ''}`, label: (v) => String(deg[v]) }} />
      <div className="da-stats">
        <span>الرؤوس <bdi dir="ltr">V = {N}</bdi></span>
        <span>الحواف <bdi dir="ltr">E = {edges.length} ≤ {maxE}</bdi></span>
        <span>مجموع الدرجات <bdi dir="ltr">Σdeg = {deg.reduce((a, b) => a + b, 0)} = 2E</bdi></span>
        <span>المكونات <bdi dir="ltr">c = {k.c}</bdi></span>
        <span>غابة إن وفقط إن <bdi dir="ltr">E = V − c = {N - k.c}</bdi></span>
      </div>
      <div className="edl-msg"><b>{kind}</b>. الرقم فوق كل رأس درجته (degree).</div>
      <div className="ap-sliders" style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-sm" onClick={rnd}>رسم عشوائي</button>
        <button className="btn btn-sm" onClick={() => { setEdges([]); setPick(null); }}>امسح الحواف</button>
        <button className="btn btn-sm" onClick={() => { setEdges(START); setPick(null); }}>البداية</button>
      </div>
    </div>
  );
}

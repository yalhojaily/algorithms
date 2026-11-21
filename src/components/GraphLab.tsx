import { useMemo, useRef, useState } from 'react';
import { bipartite, componentIds, degrees, eulerInfo, hierholzer, HIERHOLZER_PSEUDO, isTree, type Edge, type EulerFrame } from '../lib/graphs';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

type P = [number, number];
interface G { pts: P[]; E: Edge[]; names?: string[] }

const PRESETS: { label: string; g: G }[] = [
  { label: 'جسور Königsberg', g: { pts: [[260, 50], [260, 290], [170, 170], [400, 170]], E: [[0, 2], [0, 2], [1, 2], [1, 2], [0, 3], [1, 3], [2, 3]], names: ['A', 'B', 'C', 'D'] } },
  { label: 'البيت والمغلف', g: { pts: [[190, 290], [330, 290], [330, 160], [190, 160], [260, 50]], E: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [2, 4], [3, 4]] } },
  { label: 'K₄', g: { pts: [[260, 50], [120, 280], [400, 280], [260, 200]], E: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] } },
  { label: 'K₅', g: { pts: [[260, 40], [390, 135], [340, 290], [180, 290], [130, 135]], E: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] } },
  { label: 'دورة C₆', g: { pts: [[260, 40], [380, 110], [380, 240], [260, 300], [140, 240], [140, 110]], E: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] } },
  { label: 'شجرة', g: { pts: [[260, 40], [160, 130], [360, 130], [100, 230], [210, 230], [320, 230], [420, 230]], E: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]] } },
  { label: 'K₃,₃', g: { pts: [[150, 70], [260, 70], [370, 70], [150, 270], [260, 270], [370, 270]], E: [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]] } },
  { label: 'مكوّنان', g: { pts: [[120, 90], [220, 60], [200, 190], [340, 120], [430, 200], [330, 270]], E: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5]] } },
];

const COMP = ['var(--blue)', 'var(--amber)', 'var(--violet)', 'var(--green)', 'var(--brand)', 'var(--ink-2)'];

function edgeGeom(pts: P[], E: Edge[]) {
  const count = new Map<string, number>();
  const seen = new Map<string, number>();
  E.forEach(([u, v]) => { const k = [Math.min(u, v), Math.max(u, v)].join(); count.set(k, (count.get(k) ?? 0) + 1); });
  return E.map(([u, v]) => {
    const k = [Math.min(u, v), Math.max(u, v)].join();
    const c = count.get(k)!;
    const i = seen.get(k) ?? 0;
    seen.set(k, i + 1);
    const [x1, y1] = pts[Math.min(u, v)], [x2, y2] = pts[Math.max(u, v)];
    const off = (i - (c - 1) / 2) * 34;
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const mx = (x1 + x2) / 2 - (dy / L) * off, my = (y1 + y2) / 2 + (dx / L) * off;
    return { d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`, lx: (x1 + x2) / 4 + mx / 2, ly: (y1 + y2) / 4 + my / 2 };
  });
}

function EulerRun({ g }: { g: G }) {
  const n = g.pts.length;
  const info = eulerInfo(n, g.E);
  const d = degrees(n, g.E);
  const start = info.odd.length ? info.odd[0] : Math.max(0, d.findIndex((x) => x > 0));
  const frames = useMemo(() => (info.kind === 'none' ? [] : record(hierholzer(n, g.E, start))), [g, n, start, info.kind]);
  const s = useStepper<EulerFrame>(frames.length ? frames : [{ line: 1, stack: [], path: [], used: [], note: '' }], 3);
  if (info.kind === 'none') return <div className="tt-verdict v-F"><strong>لا يوجد مسار Euler.</strong> {info.reason}</div>;
  const fr = s.frame;
  return (
    <>
      <Canvas g={g} used={fr.used} cur={fr.cur} hotEdge={fr.edge} />
      <div className="tt-side">
        <Pseudocode lines={HIERHOLZER_PSEUDO} active={fr.line} />
        <div className="tt-info">
          <div className="tt-note"><span dir="auto">{fr.note}</span></div>
          <div className="tt-counters">
            <span>المكدس: <b className="ltr">[{fr.stack.map((v) => v + 1).join(', ')}]</b></span>
            <span>المسار: <b className="ltr">[{fr.path.map((v) => v + 1).join(', ')}]</b></span>
          </div>
        </div>
      </div>
      <Player s={s} />
    </>
  );
}

function Canvas({ g, used, cur, hotEdge, color, sel, onBg, onVertex }: {
  g: G; used?: boolean[]; cur?: number; hotEdge?: number; color?: (i: number) => string | undefined; sel?: number | null;
  onBg?: (p: P) => void; onVertex?: (i: number) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const geo = edgeGeom(g.pts, g.E);
  const deg = degrees(g.pts.length, g.E);
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onBg || !ref.current) return;
    if ((e.target as Element).closest('.gl-node')) return;
    const r = ref.current.getBoundingClientRect();
    onBg([((e.clientX - r.left) / r.width) * 520, ((e.clientY - r.top) / r.height) * 340]);
  };
  return (
    <svg ref={ref} viewBox="0 0 520 340" className="gl-svg" onClick={click} style={{ direction: 'ltr' }}>
      {geo.map((e, i) => (
        <path key={i} d={e.d} className={`gl-edge ${used?.[i] ? 'used' : ''} ${hotEdge === i ? 'hot' : ''}`} />
      ))}
      {g.pts.map(([x, y], i) => (
        <g key={i} className={`gl-node ${sel === i ? 'sel' : ''} ${cur === i ? 'cur' : ''} ${deg[i] % 2 ? 'odd' : ''}`} onClick={(e) => { e.stopPropagation(); onVertex?.(i); }}>
          <circle cx={x} cy={y} r="17" style={color?.(i) ? { fill: color(i), stroke: color(i) } : undefined} />
          <text x={x} y={y + 5} textAnchor="middle" className={color?.(i) ? 'on' : ''}>{g.names?.[i] ?? i + 1}</text>
          <text x={x + 20} y={y - 14} className="gl-deg">{deg[i]}</text>
        </g>
      ))}
    </svg>
  );
}

/** Build a graph by clicking; read off degrees, components, trees, bipartiteness and Euler walks. */
export default function GraphLab() {
  const [g, setG] = useState<G>(PRESETS[0].g);
  const [sel, setSel] = useState<number | null>(null);
  const [mode, setMode] = useState<'props' | 'euler'>('props');
  const n = g.pts.length;
  const d = degrees(n, g.E);
  const comp = componentIds(n, g.E);
  const nComp = new Set(comp).size;
  const bp = bipartite(n, g.E);
  const tree = isTree(n, g.E);
  const eu = eulerInfo(n, g.E);
  const simple = new Set(g.E.map(([u, v]) => [Math.min(u, v), Math.max(u, v)].join())).size === g.E.length && g.E.every(([u, v]) => u !== v);
  const color = (i: number) => (nComp > 1 ? COMP[comp[i] % COMP.length] : bp.ok ? (bp.color[i] ? 'var(--amber)' : 'var(--blue)') : undefined);

  const name = (i: number) => g.names?.[i] ?? String(i + 1);
  const addVertex = (p: P) => { if (n < 12) { setG({ ...g, pts: [...g.pts, p] }); setSel(null); } };
  const tapVertex = (i: number) => {
    if (sel === null) setSel(i);
    else if (sel === i) setSel(null);
    else { setG({ ...g, E: [...g.E, [sel, i]] }); setSel(null); }
  };

  return (
    <div className="widget card gl">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">مختبر الرسوم البيانية</span>
      </div>
      <div className="tt-presets">
        {PRESETS.map((p) => <button key={p.label} className={`tt-preset ${p.g === g ? 'on' : ''}`} onClick={() => { setG(p.g); setSel(null); }}>{p.label}</button>)}
        <button className="tt-preset" onClick={() => { setG({ pts: [], E: [] }); setSel(null); }}>ورقة فارغة</button>
        <button className="tt-preset" onClick={() => setG({ ...g, E: g.E.slice(0, -1) })} disabled={!g.E.length}>↶ احذف آخر حافة</button>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${mode === 'props' ? 'on' : ''}`} onClick={() => setMode('props')}>الخواص</button>
        <button className={`pr-tab ${mode === 'euler' ? 'on' : ''}`} onClick={() => setMode('euler')}>مسار Euler خطوة بخطوة</button>
      </div>

      {mode === 'props' ? (
        <>
          <Canvas g={g} color={color} sel={sel} onBg={addVertex} onVertex={tapVertex} />
          <div className="vm-help">اضغط مكانًا فارغًا لتضيف رأسًا، ثم اضغط رأسين لتصل بينهما بحافة. الرقم الصغير بجانب كل رأس درجته، والرؤوس ذات الدرجة الفردية محاطة بإطار أحمر.</div>
          <ul className="rel-props">
            <li className="ok"><span className="rel-mark">Σ</span><span className="rel-pname">مبرهنة المصافحة</span><span className="rel-why ltr">{d.join(' + ') || '0'} = {d.reduce((a, b) => a + b, 0)} = 2 × {g.E.length}</span></li>
            <li className={eu.odd.length % 2 ? 'bad' : 'ok'}><span className="rel-mark">◐</span><span className="rel-pname">رؤوس فردية الدرجة</span><span className="rel-why">{eu.odd.length} (عدد زوجي دائمًا)</span></li>
            <li className={nComp === 1 ? 'ok' : 'bad'}><span className="rel-mark">{nComp === 1 ? '✓' : '✗'}</span><span className="rel-pname">مترابط</span><span className="rel-why">{nComp === 1 ? 'مكوّن واحد' : `${nComp} مكوّنات، ملوّنة بألوان مختلفة`}</span></li>
            <li className={tree ? 'ok' : 'bad'}><span className="rel-mark">{tree ? '✓' : '✗'}</span><span className="rel-pname">شجرة</span><span className="rel-why">{tree ? `مترابط و|E| = n − 1 = ${n - 1}` : `n = ${n}، و|E| = ${g.E.length}${nComp > 1 ? '، وغير مترابط' : g.E.length >= n ? '، ففيه دورة' : ''}`}</span></li>
            <li className={bp.ok ? 'ok' : 'bad'}><span className="rel-mark">{bp.ok ? '✓' : '✗'}</span><span className="rel-pname">ثنائي التجزئة</span><span className="rel-why">{bp.ok ? (nComp === 1 ? 'لُوّنت الرؤوس بلونين، ولا حافة بين لونين متماثلين.' : 'يمكن تلوينه بلونين.') : `لا: الحافة ${name(bp.edge[0])}–${name(bp.edge[1])} تغلق دورة فردية الطول.`}</span></li>
            <li className={eu.kind !== 'none' ? 'ok' : 'bad'}><span className="rel-mark">{eu.kind !== 'none' ? '✓' : '✗'}</span><span className="rel-pname">مسار Euler</span><span className="rel-why">{eu.reason}</span></li>
            {!simple && <li className="ok"><span className="rel-mark">∥</span><span className="rel-pname">متعدد الحواف</span><span className="rel-why">فيه حافتان أو أكثر بين الرأسين نفسيهما (multigraph).</span></li>}
          </ul>
        </>
      ) : (
        <EulerRun key={JSON.stringify(g.E) + n} g={g} />
      )}
    </div>
  );
}

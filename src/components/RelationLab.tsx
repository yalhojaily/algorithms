import { useMemo, useState } from 'react';
import { antisymmetric, classes, fromPred, reflexive, symmetric, transitive, warshall, WARSHALL_PSEUDO, type ClosureFrame, type Matrix } from '../lib/relations';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const N = 5;
const PRESETS: { label: string; f: (a: number, b: number) => boolean }[] = [
  { label: 'a = b', f: (a, b) => a === b },
  { label: 'a ≤ b', f: (a, b) => a <= b },
  { label: 'a < b', f: (a, b) => a < b },
  { label: 'a | b', f: (a, b) => b % a === 0 },
  { label: 'a ≡ b (mod 2)', f: (a, b) => (a - b) % 2 === 0 },
  { label: 'b = a + 1', f: (a, b) => b === a + 1 },
  { label: '|a − b| ≤ 1', f: (a, b) => Math.abs(a - b) <= 1 },
  { label: '∅', f: () => false },
];

const CLASS_COLORS = ['var(--blue)', 'var(--amber)', 'var(--violet)', 'var(--green)', 'var(--brand)'];

// node positions on a circle
const CX = 130, CY = 130, R = 92;
const P = Array.from({ length: N }, (_, i) => {
  const t = -Math.PI / 2 + (2 * Math.PI * i) / N;
  return [CX + R * Math.cos(t), CY + R * Math.sin(t)] as [number, number];
});

function edgePath(i: number, j: number) {
  const [x1, y1] = P[i];
  const [x2, y2] = P[j];
  if (i === j) {
    const dx = x1 - CX, dy = y1 - CY, L = Math.hypot(dx, dy);
    const cx = x1 + (dx / L) * 22, cy = y1 + (dy / L) * 22;
    return `M ${cx - 9} ${cy} a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0`;
  }
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  const sx = x1 + ux * 15, sy = y1 + uy * 15, ex = x2 - ux * 17, ey = y2 - uy * 17;
  // bend a little so a→b and b→a don't overlap
  const mx = (sx + ex) / 2 - uy * 12, my = (sy + ey) / 2 + ux * 12;
  return `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
}

function Digraph({ M, hot = [], added = [], colorOf }: { M: Matrix; hot?: [number, number][]; added?: [number, number][]; colorOf?: (i: number) => string | undefined }) {
  const isHot = (i: number, j: number) => hot.some(([a, b]) => a === i + 1 && b === j + 1);
  const isNew = (i: number, j: number) => added.some(([a, b]) => a === i + 1 && b === j + 1);
  return (
    <svg viewBox="0 0 260 260" className="rel-svg" role="img" aria-label="مخطط العلاقة">
      <defs>
        {['n', 'h', 'g'].map((k) => (
          <marker key={k} id={`rel-arr-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className={`rel-head ${k}`} />
          </marker>
        ))}
      </defs>
      {M.map((row, i) => row.map((v, j) => {
        if (!v) return null;
        const k = isHot(i, j) ? 'h' : isNew(i, j) ? 'g' : 'n';
        return <path key={`${i}-${j}`} d={edgePath(i, j)} className={`rel-edge ${k}`} markerEnd={i === j ? undefined : `url(#rel-arr-${k})`} />;
      }))}
      {P.map(([x, y], i) => (
        <g key={i} className="rel-node">
          <circle cx={x} cy={y} r="14" style={colorOf?.(i) ? { fill: colorOf(i), stroke: colorOf(i) } : undefined} />
          <text x={x} y={y + 5} textAnchor="middle" className={colorOf?.(i) ? 'on' : ''}>{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

function Grid({ M, onToggle, hot = [], added = [], cur }: { M: Matrix; onToggle?: (i: number, j: number) => void; hot?: [number, number][]; added?: [number, number][]; cur?: { i: number; j: number; k: number } }) {
  return (
    <table className="rel-grid" dir="ltr">
      <thead>
        <tr><th className="rel-corner">a\b</th>{M.map((_, j) => <th key={j} className={cur && cur.k === j ? 'kk' : ''}>{j + 1}</th>)}</tr>
      </thead>
      <tbody>
        {M.map((row, i) => (
          <tr key={i}>
            <th className={cur && cur.k === i ? 'kk' : ''}>{i + 1}</th>
            {row.map((v, j) => {
              const h = hot.some(([a, b]) => a === i + 1 && b === j + 1);
              const g = added.some(([a, b]) => a === i + 1 && b === j + 1);
              const now = cur && cur.i === i && cur.j === j;
              const via = cur && ((cur.i === i && cur.k === j) || (cur.k === i && cur.j === j));
              return (
                <td key={j}>
                  <button className={`rel-cell ${v ? 'on' : ''} ${h ? 'hot' : ''} ${g ? 'new' : ''} ${now ? 'now' : ''} ${via ? 'via' : ''}`}
                    onClick={onToggle ? () => onToggle(i, j) : undefined} disabled={!onToggle} aria-pressed={v}>
                    {v ? '1' : '0'}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Closure({ M }: { M: Matrix }) {
  const frames = useMemo(() => record(warshall(M)), [M]);
  const s = useStepper<ClosureFrame>(frames, 3);
  const fr = s.frame;
  return (
    <>
      <div className="rel-two">
        <Grid M={fr.M} added={fr.added} cur={fr.line === 5 ? { i: fr.i, j: fr.j, k: fr.k } : fr.k >= 0 ? { i: -1, j: -1, k: fr.k } : undefined} />
        <Digraph M={fr.M} added={fr.added} hot={fr.line === 5 ? [[fr.i + 1, fr.j + 1]] : []} />
      </div>
      <div className="tt-side">
        <Pseudocode lines={WARSHALL_PSEUDO} active={fr.line} />
        <div className="tt-info">
          <div className="tt-note" aria-live="polite"><span dir="auto">{fr.note}</span></div>
          <div className="tt-counters"><span>فحوص: <b className="ltr">{fr.checks}</b></span><span>أزواج مضافة: <b className="ltr">{fr.added.length}</b></span></div>
        </div>
      </div>
      <Player s={s} />
    </>
  );
}

/** Click cells to build a relation on {1..5}; see its graph, its properties with counterexamples, and its transitive closure. */
export default function RelationLab() {
  const [M, setM] = useState<Matrix>(() => fromPred(N, PRESETS[4].f));
  const [preset, setPreset] = useState(4);
  const [mode, setMode] = useState<'props' | 'closure'>('props');

  const toggle = (i: number, j: number) => {
    setPreset(-1);
    setM((cur) => cur.map((r, a) => r.map((v, b) => (a === i && b === j ? !v : v))));
  };
  const props = [
    { name: 'انعكاسية', en: 'reflexive', c: reflexive(M), def: 'لكل a: (a, a) فيها' },
    { name: 'تماثلية', en: 'symmetric', c: symmetric(M), def: 'إذا كانت (a, b) فيها فـ (b, a) فيها' },
    { name: 'تخالفية', en: 'antisymmetric', c: antisymmetric(M), def: 'إذا كانت (a, b) و(b, a) فيها فـ a = b' },
    { name: 'متعدية', en: 'transitive', c: transitive(M), def: 'إذا كانت (a, b) و(b, c) فيها فـ (a, c) فيها' },
  ];
  const [rf, sy, an, tr] = props.map((p) => p.c.ok);
  const equiv = rf && sy && tr;
  const order = rf && an && tr;
  const cls = equiv ? classes(M) : [];
  const colorOf = equiv ? (i: number) => CLASS_COLORS[cls.findIndex((c) => c.includes(i + 1)) % CLASS_COLORS.length] : undefined;
  const [hoverProp, setHoverProp] = useState<number | null>(null);
  const hot: [number, number][] = (() => {
    const p = hoverProp !== null ? props[hoverProp] : props.find((x) => !x.c.ok);
    const w = p?.c.witness;
    if (!w || p?.c.ok) return [];
    return w.length === 3 ? [[w[0], w[1]], [w[1], w[2]], [w[0], w[2]]] : [[w[0], w[1]], [w[1], w[0]]];
  })();

  return (
    <div className="widget card rel">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">مختبر العلاقات على المجموعة <span className="ltr">{'{1, 2, 3, 4, 5}'}</span></span>
      </div>
      <div className="tt-presets" dir="ltr">
        {PRESETS.map((p, k) => (
          <button key={p.label} className={`tt-preset ${k === preset ? 'on' : ''}`} onClick={() => { setPreset(k); setM(fromPred(N, p.f)); }}>{p.label}</button>
        ))}
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${mode === 'props' ? 'on' : ''}`} onClick={() => setMode('props')}>الخواص</button>
        <button className={`pr-tab ${mode === 'closure' ? 'on' : ''}`} onClick={() => setMode('closure')}>الإغلاق المتعدي (Warshall)</button>
      </div>

      {mode === 'props' ? (
        <>
          <div className="rel-two">
            <div>
              <Grid M={M} onToggle={toggle} hot={hot} />
              <div className="vm-help">الصف a والعمود b: الخانة 1 تعني أن a R b. اضغط أي خانة لتغيّرها.</div>
            </div>
            <Digraph M={M} hot={hot} colorOf={colorOf} />
          </div>
          <ul className="rel-props">
            {props.map((p, k) => (
              <li key={p.en} className={p.c.ok ? 'ok' : 'bad'} onMouseEnter={() => setHoverProp(k)} onMouseLeave={() => setHoverProp(null)}>
                <span className="rel-mark">{p.c.ok ? '✓' : '✗'}</span>
                <span className="rel-pname">{p.name} <span className="en">{p.en}</span></span>
                <span className="rel-why" dir="auto">{p.c.ok ? p.def : p.c.why}</span>
              </li>
            ))}
          </ul>
          <div className={`tt-verdict ${equiv || order ? 'v-T' : 'v-S'}`}>
            {equiv && <div><strong>علاقة تكافؤ.</strong> صفوف التكافؤ ملوّنة في المخطط: {cls.map((c) => `{${c.join(', ')}}`).join('، ')}. وهي تقسّم المجموعة إلى أجزاء منفصلة.</div>}
            {order && <div><strong>ترتيب جزئي.</strong> انعكاسية وتخالفية ومتعدية.</div>}
            {!equiv && !order && <div>ليست علاقة تكافؤ ولا ترتيبًا جزئيًا. مرّر المؤشر على خاصية لترى المثال المضاد عليها في المخطط.</div>}
          </div>
        </>
      ) : (
        <Closure M={M} />
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { UF_PSEUDO, apply, init, maxDepth, ufFrames, type UFrame, type UOpts, type UState } from '../lib/unionfind';
import { mulberry32 } from '../lib/montecarlo';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const N = 10;
const one = (st: UState, note: string): UFrame[] => [{ st, path: [], hl: [], line: 1, note, steps: 0, done: true }];

function Forest({ f }: { f: UFrame }) {
  const { parent } = f.st;
  const kids: number[][] = parent.map(() => []);
  parent.forEach((p, i) => { if (p !== i) kids[p].push(i); });
  const roots = parent.map((p, i) => (p === i ? i : -1)).filter((i) => i >= 0);
  const pos = new Map<number, { x: number; y: number }>();
  let col = 0, maxY = 0;
  const place = (v: number, d: number) => {
    maxY = Math.max(maxY, d);
    if (!kids[v].length) { pos.set(v, { x: col++, y: d }); return; }
    kids[v].forEach((c) => place(c, d + 1));
    const xs = kids[v].map((c) => pos.get(c)!.x);
    pos.set(v, { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: d });
  };
  roots.forEach((r) => { place(r, 0); col += 0.4; });
  const W = 520, dx = W / Math.max(col, 1), LH = 44;
  const H = (maxY + 1) * LH + 18;
  const X = (x: number) => dx * (x + 0.5), Y = (y: number) => 22 + y * LH;
  const onPath = new Set(f.path);
  return (
    <svg className="tv uf-svg" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }} direction="ltr">
      {parent.map((p, i) => p !== i && (
        <line key={`e${i}`} x1={X(pos.get(i)!.x)} y1={Y(pos.get(i)!.y)} x2={X(pos.get(p)!.x)} y2={Y(pos.get(p)!.y)}
          className={`tv-edge ${onPath.has(i) && onPath.has(p) ? 'on' : ''} ${f.linked && f.linked[0] === i ? 'new' : ''}`} />
      ))}
      {parent.map((p, i) => {
        const q = pos.get(i)!;
        const cls = f.hl.includes(i) ? 'hl' : onPath.has(i) ? 'path' : '';
        return (
          <g key={i} className={`tv-node ${cls} ${p === i ? 'root' : ''}`}>
            <circle cx={X(q.x)} cy={Y(q.y)} r={15} />
            <text x={X(q.x)} y={Y(q.y) + 4} textAnchor="middle">{i}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Union-Find on ten elements, with union by rank and path compression switchable. */
export default function UnionFindLab() {
  const [o, setO] = useState<UOpts>({ byRank: true, compress: true });
  const [frames, setFrames] = useState<UFrame[]>(() => one(init(N), 'عشر مجموعات، في كل منها عنصر واحد'));
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [seed, setSeed] = useState(4);
  const s = useStepper<UFrame>(frames, 2);
  const f = s.frame;
  const base = frames[frames.length - 1].st;
  const sets = useMemo(() => f.st.parent.filter((p, i) => p === i).length, [f]);
  const run = (op: 'find' | 'union') => setFrames(record(ufFrames(base, op, a, b, o)));
  const chain = () => {
    let st = init(N);
    for (let i = 0; i < N - 1; i++) st = apply(st, 'union', i + 1, i, o);
    setFrames(one(st, `تسعة اتحادات متتالية: كل عنصر مع الذي قبله. أقصى عمق الآن ${maxDepth(st)}. جرّب FIND للعنصر 0`));
    setA(0);
  };
  const random = () => {
    const r = mulberry32(seed); setSeed(seed + 1);
    let st = init(N);
    const ops: string[] = [];
    for (let t = 0; t < 6; t++) { const x = Math.floor(r() * N), y = Math.floor(r() * N); st = apply(st, 'union', x, y, o); ops.push(`(${x}, ${y})`); }
    setFrames(one(st, `ستة اتحادات عشوائية: ${ops.join('، ')}`));
  };
  const opts = Array.from({ length: N }, (_, i) => <option key={i} value={i}>{i}</option>);

  return (
    <div className="widget card uf">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">Union-Find: غابة من الأشجار المقلوبة</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <label className="uf-chk"><input type="checkbox" checked={o.byRank} onChange={(e) => setO({ ...o, byRank: e.target.checked })} /> الاتحاد بالرتبة</label>
        <label className="uf-chk"><input type="checkbox" checked={o.compress} onChange={(e) => setO({ ...o, compress: e.target.checked })} /> ضغط المسار</label>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">a =</span><select value={a} onChange={(e) => setA(+e.target.value)} dir="ltr">{opts}</select>
        <span className="qg-label">b =</span><select value={b} onChange={(e) => setB(+e.target.value)} dir="ltr">{opts}</select>
        <button className="btn btn-sm" onClick={() => run('union')}>UNION(a, b)</button>
        <button className="btn btn-sm" onClick={() => run('find')}>FIND(a)</button>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">ابدأ من جديد:</span>
        <button className="tt-preset" onClick={() => setFrames(one(init(N), 'عشر مجموعات منفصلة'))}>منفصلة</button>
        <button className="tt-preset" onClick={chain}>سلسلة اتحادات</button>
        <button className="tt-preset" onClick={random}>عشوائية 🎲</button>
      </div>

      <div className="tv-wrap"><Forest f={f} /></div>
      <div className="uf-arr" dir="ltr">
        <div className="ls-row"><span className="ls-name">i</span>{f.st.parent.map((_, i) => <span key={i} className="ls-cell idx">{i}</span>)}</div>
        <div className="ls-row"><span className="ls-name">parent</span>{f.st.parent.map((p, i) => <span key={i} className={`ls-cell ${f.path.includes(i) ? 'hl' : ''} ${p === i ? 'c' : ''}`}>{p}</span>)}</div>
        {o.byRank && <div className="ls-row"><span className="ls-name">rank</span>{f.st.rank.map((r, i) => <span key={i} className="ls-cell">{r}</span>)}</div>}
      </div>
      <div className="da-stats">
        <span>عدد المجموعات: <b className="ltr">{sets}</b></span>
        <span>أقصى عمق: <b className="ltr">{maxDepth(f.st)}</b></span>
        <span>خطوات هذه العملية: <b className="ltr">{f.steps}</b></span>
      </div>
      <div className="tt-side">
        <Pseudocode lines={UF_PSEUDO} active={f.line} />
        <div className="tt-info"><div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}>{f.note}</div></div>
      </div>
      <Player s={s} />
    </div>
  );
}

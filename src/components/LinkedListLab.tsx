import { useMemo, useState } from 'react';
import { LL_PROGRAMS, type LLFrame } from '../lib/linkedlist';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const CW = 96, RH = 100, NW = 56, NH = 34;
const PCOL: Record<string, string> = { prev: 'var(--blue)', cur: 'var(--brand)', nxt: 'var(--amber)', slow: 'var(--green)', fast: 'var(--brand)', p: 'var(--brand)', a: 'var(--blue)', b: 'var(--amber)', tail: 'var(--brand)' };

/** Pointer manipulation on linked lists, step by step: nodes, next arrows and named pointers. */
export default function LinkedListLab() {
  const [key, setKey] = useState('rev');
  const P = LL_PROGRAMS.find((p) => p.key === key)!;
  const frames = useMemo(() => record(P.run()), [P]);
  const s = useStepper<LLFrame>(frames, 1.5);
  const fr = s.frame;

  const cols = Math.max(...P.nodes.map((n) => n.x)) + 1;
  const rows = Math.max(...P.nodes.map((n) => n.y)) + 1;
  const W = cols * CW + 50, H = rows * RH + 30;
  const X = (i: number) => 24 + P.nodes[i].x * CW;
  const Y = (i: number) => 30 + P.nodes[i].y * RH;

  const arrow = (from: number, to: number) => {
    const x1 = X(from) + NW - 8, y1 = Y(from) + NH / 2;
    const x2 = X(to), y2 = Y(to) + NH / 2;
    const sameRowForward = P.nodes[from].y === P.nodes[to].y && P.nodes[to].x === P.nodes[from].x + 1;
    if (sameRowForward) return `M ${x1} ${y1} L ${x2 - 3} ${y2}`;
    if (P.nodes[from].y !== P.nodes[to].y) {
      const tx = X(to) + NW / 2, ty = P.nodes[to].y > P.nodes[from].y ? Y(to) - 2 : Y(to) + NH + 2;
      return `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${tx} ${(y1 + ty) / 2}, ${tx} ${ty}`;
    }
    // same row, backwards or skipping: arc above (or below for the second half of a reversed list)
    const lift = 26 + 10 * Math.abs(P.nodes[to].x - P.nodes[from].x);
    const dir = P.nodes[to].x < P.nodes[from].x ? 1 : -1; // backward arcs go below, skips go above
    const xs = X(from) + NW / 2, xe = X(to) + NW / 2;
    const yb = dir > 0 ? Y(from) + NH : Y(from);
    return `M ${xs} ${yb} C ${xs} ${yb + dir * lift}, ${xe} ${yb + dir * lift}, ${xe} ${yb + (dir > 0 ? 2 : -2)}`;
  };

  const labels: Record<number, string[]> = {};
  Object.entries(fr.ptrs).forEach(([name, id]) => { if (id !== null && id !== undefined) (labels[id] ??= []).push(name); });
  const nullPtrs = Object.entries(fr.ptrs).filter(([, id]) => id === null).map(([n]) => n);

  return (
    <div className="widget card ll">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">خوارزميات المؤشرات خطوة خطوة</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {LL_PROGRAMS.map((p) => <button key={p.key} className={`pr-tab ${p.key === key ? 'on' : ''}`} onClick={() => setKey(p.key)}>{p.label}</button>)}
      </div>

      <div className="ll-canvas" dir="ltr">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, maxWidth: 'none' }}>
          <defs>
            <marker id="llh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" /></marker>
            <marker id="llh2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--brand)" /></marker>
          </defs>
          {P.nodes.map((_, i) => {
            const to = fr.next[i];
            if (fr.gone?.includes(i)) return null;
            if (to === null || to === undefined) return <text key={`n${i}`} x={X(i) + NW + 4} y={Y(i) + NH / 2 + 5} className="ll-null">∅</text>;
            return <path key={`a${i}`} d={arrow(i, to)} className={`ll-arrow ${fr.changed === i ? 'hot' : ''}`} markerEnd={fr.changed === i ? 'url(#llh2)' : 'url(#llh)'} />;
          })}
          {P.nodes.map((n, i) => (
            <g key={i} className={`ll-node ${n.sentinel ? 'sent' : ''} ${fr.gone?.includes(i) ? 'gone' : ''}`}>
              <rect x={X(i)} y={Y(i)} width={NW} height={NH} rx={7} />
              <line x1={X(i) + NW - 16} x2={X(i) + NW - 16} y1={Y(i)} y2={Y(i) + NH} />
              <text x={X(i) + (NW - 16) / 2} y={Y(i) + NH / 2 + 5} textAnchor="middle">{n.val}</text>
              {(labels[i] ?? []).map((name, k) => (
                <text key={name} x={X(i) + NW / 2 - 8} y={Y(i) - 8 - k * 14} textAnchor="middle" className="ll-ptr" style={{ fill: PCOL[name] ?? 'var(--ink)' }}>{name}</text>
              ))}
            </g>
          ))}
        </svg>
      </div>
      {nullPtrs.length > 0 && <div className="ll-nulls" dir="ltr">{nullPtrs.map((n) => <span key={n} style={{ color: PCOL[n] }}>{n} = null</span>)}</div>}

      <div className="tt-side">
        <Pseudocode lines={P.pseudo} active={fr.line} />
        <div className="tt-info">
          <div className={`inv-banner ${fr.done ? '' : 'on'}`}>{fr.note}</div>
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

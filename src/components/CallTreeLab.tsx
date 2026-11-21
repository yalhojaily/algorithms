import { useMemo, useState } from 'react';
import { REC_PROGRAMS, maxDepth, replay, type RecFrame } from '../lib/recursion';
import { Player, Pseudocode, useStepper } from '../engine/stepper';

/** Replay a recursive computation: the call stack on one side, the call tree growing on the other. */
export default function CallTreeLab() {
  const [key, setKey] = useState('fact');
  const P = REC_PROGRAMS.find((p) => p.key === key)!;
  const [n, setN] = useState(P.start);
  const t = useMemo(() => P.run(n), [P, n]);
  const frames = useMemo(() => replay(t), [t]);
  const s = useStepper<RecFrame>(frames, 2);
  const fr = s.frame;

  const pick = (k: string) => { const Q = REC_PROGRAMS.find((p) => p.key === k)!; setKey(k); setN(Q.start); };
  const node = t.nodes[fr.active];
  const ev = fr.event.type === 'call'
    ? <>استدعاء <b className="ltr">{node.label}</b>، وعمق المكدس الآن <b className="ltr">{fr.stack.length}</b>.</>
    : <><b className="ltr">{node.label}</b> يعيد <b className="ltr">{node.value}</b>{node.parent !== null ? <> إلى <b className="ltr">{t.nodes[node.parent].label}</b> الذي كان ينتظره.</> : <>: هذا هو الجواب.</>}</>;

  const distinct = new Set(t.nodes.map((x) => x.label)).size;
  const leaves = Math.max(...t.nodes.map((x) => x.x)) + 1;
  const depth = maxDepth(t);
  const CW = key === 'hanoi' ? 86 : key === 'pow' ? 92 : 66, RH = 58;
  const W = Math.max(leaves * CW, 300), H = depth * RH + 10;
  const X = (x: number) => CW / 2 + x * CW;
  const Y = (d: number) => 22 + d * RH;
  const onStack = new Set(fr.stack);

  return (
    <div className="widget card rt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">مكدس الاستدعاءات وشجرة الاستدعاء</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {REC_PROGRAMS.map((p) => <button key={p.key} className={`pr-tab ${p.key === key ? 'on' : ''}`} onClick={() => pick(p.key)}>{p.label}</button>)}
      </div>
      <div className="ct-size">
        <label>
          <span className="qg-label">{P.param} = <b className="ltr">{n}</b></span>
          <input type="range" min={P.min} max={P.max} value={n} onChange={(e) => setN(+e.target.value)} />
        </label>
        <span className="ct-note">
          الاستدعاءات: <b className="ltr">{fr.seen} / {t.nodes.length}</b>،
          أقصى عمق: <b className="ltr">{depth}</b>
          {key === 'fib' && <>، استدعاءات مكررة: <b className="ltr">{t.nodes.length - distinct}</b></>}
        </span>
      </div>

      <div className="tt-side">
        <Pseudocode lines={P.pseudo} active={fr.event.type === 'call' ? 1 : null} title="PSEUDOCODE" />
        <div className="tt-info">
          <div className="rt-stack" aria-label="مكدس الاستدعاءات">
            <div className="rt-stack-h">المكدس (الأعلى هو النشط)</div>
            {fr.stack.length === 0 && <div className="rt-empty">فارغ: انتهى التنفيذ. النتيجة <b className="ltr">{t.result}</b></div>}
            {[...fr.stack].reverse().map((id, k) => (
              <div key={id} className={`rt-frame ${k === 0 ? 'top' : ''}`} dir="ltr">
                <span>{t.nodes[id].label}</span>
                <i>{k === 0 ? (fr.event.type === 'call' ? 'running' : 'resumed') : 'waiting'}</i>
              </div>
            ))}
          </div>
          <div className="inv-banner on">{ev}</div>
        </div>
      </div>

      <div className="rt-tree" dir="ltr">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, maxWidth: 'none' }}>
          {t.nodes.slice(0, fr.seen).map((x) => x.parent !== null && (
            <line key={`e${x.id}`} x1={X(t.nodes[x.parent].x)} y1={Y(t.nodes[x.parent].depth) + 13} x2={X(x.x)} y2={Y(x.depth) - 13} className="rt-edge" />
          ))}
          {t.nodes.slice(0, fr.seen).map((x) => {
            const st = x.id === fr.active ? 'active' : onStack.has(x.id) ? 'wait' : fr.returned.has(x.id) ? 'done' : '';
            return (
              <g key={x.id} className={`rt-node ${st}`}>
                <rect x={X(x.x) - CW / 2 + 4} y={Y(x.depth) - 13} width={CW - 8} height={26} rx={8} />
                <text x={X(x.x)} y={Y(x.depth) + 4} textAnchor="middle">{x.label}</text>
                {fr.returned.has(x.id) && <text x={X(x.x)} y={Y(x.depth) + 27} textAnchor="middle" className="rt-val">= {x.value}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <Player s={s} />
    </div>
  );
}

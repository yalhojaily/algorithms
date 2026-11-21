import { useMemo, useState } from 'react';
import { tileSteps, TILE_PSEUDO, type TileFrame } from '../lib/tromino';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const LEVEL_COLORS = ['var(--brand)', 'var(--blue)', 'var(--amber)', 'var(--violet)', 'var(--green)'];

/** The induction proof of lesson 0.6 as a recursive algorithm: tile a 2^k board with one square removed. */
export default function TrominoTiling() {
  const [k, setK] = useState(3);
  const n = 2 ** k;
  const [miss, setMiss] = useState<[number, number]>([2, 5]);
  const mr = Math.min(miss[0], n - 1);
  const mc = Math.min(miss[1], n - 1);
  const frames = useMemo(() => record(tileSteps(k, mr, mc), 20000), [k, mr, mc]);
  const s = useStepper<TileFrame>(frames, 4);
  const fr = s.frame;

  const owner = new Map<string, { level: number; last: boolean }>();
  fr.pieces.forEach((p, idx) => p.cells.forEach(([r, c]) => owner.set(`${r},${c}`, { level: p.level, last: idx === fr.pieces.length - 1 && fr.line === 4 })));
  const [rt, rl, rs] = fr.region;
  const cell = Math.floor(288 / n);

  return (
    <div className="widget card tr">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">البرهان بالاستقراء كخوارزمية: تبليط الفناء بقطع L</span>
      </div>
      <div className="ps-n">
        <span className="qg-label">حجم اللوح:</span>
        {[1, 2, 3, 4].map((kk) => (
          <button key={kk} className={`tt-preset ${kk === k ? 'on' : ''}`} onClick={() => setK(kk)}>
            <span className="ltr">{2 ** kk}×{2 ** kk}</span>
          </button>
        ))}
        <span className="vm-help" style={{ margin: 0 }}>اضغط أي مربع لتنقل إليه التمثال ★</span>
      </div>

      <div className="tr-wrap">
        <div className="tr-board" style={{ gridTemplateColumns: `repeat(${n}, ${cell}px)`, gridAutoRows: `${cell}px` }} dir="ltr">
          {Array.from({ length: n * n }, (_, x) => {
            const r = Math.floor(x / n), c = x % n;
            const o = owner.get(`${r},${c}`);
            const isMiss = r === mr && c === mc;
            const inRegion = r >= rt && r < rt + rs && c >= rl && c < rl + rs;
            return (
              <button
                key={x}
                className={`tr-cell ${isMiss ? 'miss' : ''} ${o ? 'on' : ''} ${o?.last ? 'last' : ''} ${inRegion && fr.line !== 6 ? 'reg' : ''}`}
                style={o ? { background: LEVEL_COLORS[o.level % LEVEL_COLORS.length] } : undefined}
                onClick={() => setMiss([r, c])}
                aria-label={`مربع ${r + 1}، ${c + 1}`}
              >
                {isMiss ? '★' : ''}
              </button>
            );
          })}
          {fr.line !== 6 && rs > 1 && (
            <div className="tr-frame" style={{ top: rt * cell, left: rl * cell, width: rs * cell, height: rs * cell }} />
          )}
        </div>
        <div className="tr-legend">
          {Array.from({ length: k }, (_, d) => (
            <span key={d}><i style={{ background: LEVEL_COLORS[d % LEVEL_COLORS.length] }} /> مستوى الاستدعاء {d}</span>
          ))}
        </div>
      </div>

      <div className="tt-side">
        <Pseudocode lines={TILE_PSEUDO} active={fr.line === 4 ? 4 : fr.line} />
        <div className="tt-info">
          <div className="tt-note" aria-live="polite"><span dir="auto">{fr.note}</span></div>
          <div className="tt-counters">
            <span>قطع موضوعة: <b className="ltr">{fr.pieces.length} / {(n * n - 1) / 3}</b></span>
            <span>عمق الاستدعاء: <b className="ltr">{fr.depth}</b></span>
          </div>
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

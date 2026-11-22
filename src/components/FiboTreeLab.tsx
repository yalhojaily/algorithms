import { useMemo, useState } from 'react';
import { fibTree, type FNode } from '../lib/dp';
import { Player, useStepper } from '../engine/stepper';

type Mode = 'rec' | 'memo' | 'iter';

/** RecFibo's tree, the same tree trimmed by memoization, and the table IterFibo fills on purpose. */
export default function FiboTreeLab() {
  const [n0, setN] = useState(6);
  const [mode, setMode] = useState<Mode>('rec');
  const n = mode === 'rec' ? Math.min(n0, 8) : n0;
  const t = useMemo(() => fibTree(n, mode !== 'rec'), [n, mode]);
  const iterFrames = useMemo(() => Array.from({ length: n + 1 }, (_, k) => k), [n]);
  const order = useMemo(() => [...t.nodes].sort((a, b) => a.order - b.order), [t]);
  const s = useStepper<number>(mode === 'iter' ? iterFrames : order.map((_, k) => k), mode === 'iter' ? 2 : 6);
  const k = s.frame;
  const fib = (m: number) => { let a = 0, b = 1; for (let i = 0; i < m; i++) [a, b] = [b, a + b]; return a; };
  const W = Math.max(320, t.leaves * 30), depth = Math.max(...t.nodes.map((v) => v.depth));
  const H = (depth + 1) * 44 + 16;
  const X = (x: number) => 16 + (x + 0.5) * ((W - 32) / t.leaves);
  const Y = (d: number) => 20 + d * 44;
  const cur = mode === 'iter' ? null : order[k];
  const seen = (v: FNode) => cur !== null && v.order <= cur.order;
  const written = mode === 'iter' ? k : Math.max(1, ...t.nodes.filter((v) => seen(v) && v.kind === 'write').map((v) => v.n));
  return (
    <div className="widget card fbt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">Fibonacci ثلاث مرات: تكرار، ثم ذاكرة، ثم ترتيب متعمّد</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {([['rec', 'RecFibo'], ['memo', 'MemFibo'], ['iter', 'IterFibo']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} className={`tt-preset ${m === mode ? 'on' : ''}`} onClick={() => setMode(m)}><span className="ltr">{l}</span></button>
        ))}
      </div>
      <div className="ap-sliders">
        <label><span>n = <b>{n}</b></span><input type="range" min={2} max={mode === 'rec' ? 8 : 12} value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      {mode !== 'iter' && (
        <div className="sst-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 620), display: 'block', width: '100%' }} direction="ltr">
            {t.nodes.filter((v) => v.parent >= 0).map((v) => {
              const p = t.nodes[v.parent];
              return <line key={`e${v.id}`} x1={X(p.x)} y1={Y(p.depth) + 11} x2={X(v.x)} y2={Y(v.depth) - 11} className={`fbt-e ${seen(v) ? '' : 'sst-ghost'}`} />;
            })}
            {t.nodes.map((v) => (
              <g key={v.id} className={`fbt-n ${v.kind} ${seen(v) ? '' : 'sst-ghost'} ${cur && v.id === cur.id ? 'cur' : ''}`}>
                <circle cx={X(v.x)} cy={Y(v.depth)} r={12} />
                <text x={X(v.x)} y={Y(v.depth) + 4} textAnchor="middle">F{v.n}</text>
              </g>
            ))}
          </svg>
        </div>
      )}
      {mode !== 'rec' && <div className="fbt-arr" dir="ltr">
        <span className="fbt-al">F[ ] =</span>
        {Array.from({ length: n + 1 }, (_, i) => (
          <span key={i} className={`${i <= written ? 'on' : ''} ${mode === 'iter' && i === k ? 'cur' : ''}`}>
            <small>{i}</small>{i <= written ? fib(i) : '·'}
          </span>
        ))}
      </div>}
      <div className="da-stats">
        {mode === 'rec' && <span>الاستدعاءات: <b className="ltr">{k + 1}</b> من <bdi dir="ltr">2F<sub>{n + 1}</sub> − 1 = {2 * fib(n + 1) - 1}</bdi></span>}
        {mode === 'memo' && <span>الاستدعاءات: <b className="ltr">{k + 1}</b> من <bdi dir="ltr">2n − 1 = {2 * n - 1}</bdi></span>}
        {mode === 'iter' && <span>جمعات: <b className="ltr">{Math.max(0, k - 1)}</b> من <bdi dir="ltr">n − 1 = {n - 1}</bdi></span>}
        <span>الجواب <bdi dir="ltr">F<sub>{n}</sub> = {fib(n)}</bdi></span>
      </div>
      <div className="vm-help">
        {mode === 'rec' && 'كل عقدة استدعاء. لاحظ كم مرة يُحسب الشيء نفسه من الصفر: F3 وحدها تُحسب مرات كثيرة.'}
        {mode === 'memo' && 'العقد الخضراء تكتب نتيجتها في الجدول، والحمراء تقرأ نتيجة مكتوبة فلا تستدعي شيئًا. والجدول يمتلئ من الأسفل: F2 ثم F3 ثم ...'}
        {mode === 'iter' && 'لا استدعاءات أصلًا: حلقة تملأ الجدول بالترتيب الذي اكتشفناه في MemFibo، عمدًا لا مصادفة.'}
      </div>
      <Player s={s} />
    </div>
  );
}

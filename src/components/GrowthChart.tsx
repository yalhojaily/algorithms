import { useState } from 'react';

const FNS: { key: string; label: string; f: (n: number) => number; color: string }[] = [
  { key: 'log', label: 'log₂ n', f: (n) => Math.log2(n), color: 'var(--green)' },
  { key: 'sqrt', label: '√n', f: (n) => Math.sqrt(n), color: 'var(--blue)' },
  { key: 'n', label: 'n', f: (n) => n, color: 'var(--ink-2)' },
  { key: 'nlog', label: 'n log₂ n', f: (n) => n * Math.log2(n), color: 'var(--violet)' },
  { key: 'n2', label: 'n²', f: (n) => n * n, color: 'var(--amber)' },
  { key: 'exp', label: '2ⁿ', f: (n) => 2 ** n, color: 'var(--brand)' },
];

/** The growth hierarchy, on a linear or a logarithmic vertical axis. */
export default function GrowthChart() {
  const [maxN, setMaxN] = useState(64);
  const [logY, setLogY] = useState(true);
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(FNS.map((f) => [f.key, true])));

  const W = 560, H = 280, L = 52, B = 30, T = 12, R = 12;
  const xs = Array.from({ length: 120 }, (_, i) => 1 + ((maxN - 1) * i) / 119);
  const yMax = logY ? Math.max(...FNS.filter((f) => on[f.key]).map((f) => Math.log10(Math.max(f.f(maxN), 1))), 1) : Math.max(maxN * maxN, 1);
  const yLinMax = logY ? 0 : Math.max(...FNS.filter((f) => on[f.key] && f.key !== 'exp').map((f) => f.f(maxN)), maxN);
  const yTop = logY ? Math.ceil(yMax) : yLinMax;
  const X = (n: number) => L + ((n - 1) / (maxN - 1)) * (W - L - R);
  const Y = (v: number) => {
    const t = logY ? Math.log10(Math.max(v, 1)) / yTop : v / yTop;
    return H - B - Math.min(Math.max(t, 0), 1.05) * (H - B - T);
  };
  const step = Math.max(1, Math.ceil(yTop / 8));
  const ticks = logY ? Array.from({ length: Math.floor(yTop / step) + 1 }, (_, i) => i * step) : [0, 0.25, 0.5, 0.75, 1].map((t) => t * yTop);

  return (
    <div className="widget card gc">
      <div className="widget-head">
        <span className="widget-kicker">جرّب بنفسك</span>
        <span className="widget-title">سباق النمو</span>
      </div>
      <div className="ps-n">
        <span className="qg-label">n حتى</span>
        {[16, 64, 1024].map((v) => <button key={v} className={`tt-preset ${v === maxN ? 'on' : ''}`} onClick={() => setMaxN(v)}>{v}</button>)}
        <button className={`tt-preset ${logY ? 'on' : ''}`} onClick={() => setLogY(!logY)}>محور رأسي لوغاريتمي</button>
      </div>
      <div className="gc-legend" dir="ltr">
        {FNS.map((f) => (
          <button key={f.key} className={`gc-key ${on[f.key] ? 'on' : ''}`} onClick={() => setOn({ ...on, [f.key]: !on[f.key] })}>
            <i style={{ background: f.color }} />{f.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="lc-svg" style={{ direction: 'ltr' }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={logY ? H - B - (t / yTop) * (H - B - T) : Y(t)} y2={logY ? H - B - (t / yTop) * (H - B - T) : Y(t)} className="gc-grid" />
            <text x={L - 6} y={(logY ? H - B - (t / yTop) * (H - B - T) : Y(t)) + 4} textAnchor="end" className="lc-lbl">{logY ? `10^${t}` : Math.round(t).toLocaleString('en')}</text>
          </g>
        ))}
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} className="lc-axis" />
        <text x={W - R} y={H - 8} textAnchor="end" className="lc-lbl">n = {maxN}</text>
        {FNS.filter((f) => on[f.key]).map((f) => (
          <polyline key={f.key} fill="none" stroke={f.color} strokeWidth="2.4" points={xs.map((n) => `${X(n)},${Y(f.f(n))}`).join(' ')} />
        ))}
      </svg>
      <div className="vm-help">
        {logY
          ? 'على المحور اللوغاريتمي يصبح كل كثير حدود منحنى ينحني إلى الأسفل، أما 2ⁿ فيصبح خطًا مستقيمًا صاعدًا: هذه علامة النمو الأسّي.'
          : 'على المحور الخطي (دون 2ⁿ) تبدو log₂ n مسطّحة تقريبًا بجانب n².'}
      </div>
    </div>
  );
}

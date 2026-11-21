import { useMemo, useState } from 'react';
import { CHECKPOINTS, EXPERIMENTS, runExperiment, type McFrame } from '../lib/montecarlo';
import { Player, Pseudocode, useStepper } from '../engine/stepper';
import { Tex } from './MathText';

/** Run a random experiment thousands of times and watch the estimate settle on the exact answer. */
export default function MonteCarloLab() {
  const [ek, setEk] = useState('monty');
  const E = EXPERIMENTS.find((e) => e.key === ek)!;
  const [params, setParams] = useState<Record<string, number>>(Object.fromEntries(EXPERIMENTS.map((e) => [e.key, e.param?.initial ?? 0])));
  const [seed, setSeed] = useState(2026);
  const p = params[ek];
  const frames = useMemo(() => runExperiment(E, p, seed), [E, p, seed]);
  const s = useStepper<McFrame>(frames, 2);
  const fr = s.frame;
  const exact = E.exact(p);
  const fmt = (x: number) => (E.measure === 'prob' ? `${(x * 100).toFixed(1)}%` : x.toFixed(2));

  // convergence chart: x = log10(trials), y = estimate
  const W = 560, HH = 200, L = 46, B = 26, T = 10, R = 12;
  const lo = Math.min(exact * 0.4, ...fr.history.map((h) => h[1])), hi = Math.max(exact * 1.6, ...fr.history.map((h) => h[1]), E.measure === 'prob' ? 0 : 0);
  const yMin = E.measure === 'prob' ? 0 : Math.max(0, lo), yMax = E.measure === 'prob' ? 1 : hi;
  const X = (t: number) => L + (Math.log10(t) / Math.log10(CHECKPOINTS[CHECKPOINTS.length - 1])) * (W - L - R);
  const Y = (v: number) => HH - B - ((v - yMin) / (yMax - yMin || 1)) * (HH - B - T);

  return (
    <div className="widget card mc">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">مختبر Monte Carlo: كرّر التجربة وراقب التقدير</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {EXPERIMENTS.map((e) => <button key={e.key} className={`pr-tab ${e.key === ek ? 'on' : ''}`} onClick={() => setEk(e.key)}>{e.label}</button>)}
      </div>
      {E.param && (
        <div className="ps-n">
          <span className="qg-label">{E.param.label}:</span>
          {E.param.values.map((v) => (
            <button key={v} className={`tt-preset ${v === p ? 'on' : ''}`} onClick={() => setParams({ ...params, [ek]: v })}>
              {ek === 'monty' ? (v ? 'بدّل' : 'ابقَ') : v}
            </button>
          ))}
          <button className="tt-preset" onClick={() => setSeed(seed + 1)}>🎲 بذرة عشوائية أخرى</button>
        </div>
      )}

      <div className="mc-cards">
        <div><span>عدد التجارب</span><b className="ltr">{fr.trials.toLocaleString('en')}</b></div>
        <div><span>{E.measure === 'prob' ? 'التقدير (نسبة النجاح)' : 'التقدير (المتوسط)'}</span><b className="ltr">{fmt(fr.mean)}</b></div>
        <div><span>القيمة الدقيقة</span><b className="ltr">{fmt(exact)}</b></div>
        <div><span>الخطأ</span><b className="ltr">{E.measure === 'prob' ? `${(Math.abs(fr.mean - exact) * 100).toFixed(1)} نقطة` : Math.abs(fr.mean - exact).toFixed(2)}</b></div>
      </div>

      <svg viewBox={`0 0 ${W} ${HH}`} className="lc-svg" style={{ direction: 'ltr' }}>
        <line x1={L} y1={Y(exact)} x2={W - R} y2={Y(exact)} className="mc-exact" />
        <text x={W - R} y={Y(exact) - 5} textAnchor="end" className="lc-lbl">الدقيقة</text>
        <line x1={L} y1={HH - B} x2={W - R} y2={HH - B} className="lc-axis" />
        {[1, 10, 100, 1000, 10000].map((t) => <text key={t} x={X(t)} y={HH - 8} textAnchor="middle" className="lc-lbl">{t.toLocaleString('en')}</text>)}
        {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => <text key={i} x={L - 6} y={Y(v) + 4} textAnchor="end" className="lc-lbl">{fmt(v)}</text>)}
        <polyline fill="none" stroke="var(--brand)" strokeWidth="2.4" points={fr.history.map(([t, v]) => `${X(t)},${Y(v)}`).join(' ')} />
        {fr.history.map(([t, v]) => <circle key={t} cx={X(t)} cy={Y(v)} r="3.5" className="mc-dot" />)}
      </svg>

      <div className="tt-side">
        <Pseudocode lines={E.pseudo(p)} active={null} title="One trial" />
        <div className="tt-info">
          <div className="tt-note"><span dir="auto">آخر تجربة: {fr.last.text}</span></div>
          <div className="mc-formula"><Tex>{`${E.measure === 'prob' ? '\\Pr' : '\\mathbb{E}'} = ${E.exactTex(p)} \\approx ${E.measure === 'prob' ? exact.toFixed(4) : exact.toFixed(3)}`}</Tex></div>
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

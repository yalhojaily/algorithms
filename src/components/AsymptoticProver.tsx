import { useMemo, useState } from 'react';
import { FNS, compareGrowth, firstFailure, holdsAt, truth, type Rel } from '../lib/asymp';
import { Tex } from './MathText';

const CS = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 10, 20, 50, 100, 1000];
const RANGES = [20, 100, 1000, 100000];
const REL_TEX: Record<Rel, string> = { O: 'O', Omega: '\\Omega', Theta: '\\Theta' };

const PRESETS: { label: string; f: string; g: string; rel: Rel }[] = [
  { label: '3n² + 10n + 50 = O(n²)', f: 'poly', g: 'n2', rel: 'O' },
  { label: 'n²/100 = Θ(n²)', f: 'n2s', g: 'n2', rel: 'Theta' },
  { label: 'n log n = Ω(n)', f: 'nlog', g: 'n', rel: 'Omega' },
  { label: 'n² = O(100n)؟', f: 'n2', g: '100n', rel: 'O' },
  { label: 'log n = O(√n)', f: 'log', g: 'sqrt', rel: 'O' },
  { label: 'n³ = O(2ⁿ)', f: 'n3', g: 'exp', rel: 'O' },
];

const fmt = (v: number) => (v >= 1e15 ? v.toExponential(2) : v >= 1e6 ? v.toExponential(2) : Number.isInteger(v) ? v.toLocaleString('en') : v.toFixed(2));

/** Choose c and n₀ and see whether they witness f = O(g), Ω(g) or Θ(g). */
export default function AsymptoticProver() {
  const [fk, setF] = useState('poly');
  const [gk, setG] = useState('n2');
  const [rel, setRel] = useState<Rel>('O');
  const [ci1, setC1] = useState(8);   // index into CS: 1
  const [ci2, setC2] = useState(11);  // 4
  const [n0, setN0] = useState(1);
  const [maxN, setMax] = useState(20);
  const [logY, setLogY] = useState(false);

  const f = FNS.find((x) => x.key === fk)!;
  const g = FNS.find((x) => x.key === gk)!;
  // For Θ, the slider "c₁" is the lower constant and "c₂" the upper one.
  const w = rel === 'Theta' ? { c1: CS[ci1], c2: CS[ci2], n0 } : { c1: rel === 'O' ? CS[ci2] : CS[ci1], c2: 0, n0 };
  const fail = useMemo(() => firstFailure(f, g, rel, w), [f, g, rel, w.c1, w.c2, w.n0]);
  const isTrue = truth(f, g, rel);

  const preset = (p: (typeof PRESETS)[number]) => { setF(p.f); setG(p.g); setRel(p.rel); setN0(1); setMax(20); };

  // ---- plot ----
  const W = 560, H = 260, L = 56, B = 28, T = 12, R = 12;
  const xs = Array.from({ length: 161 }, (_, i) => 1 + ((maxN - 1) * i) / 160);
  const lines: { key: string; pts: number[]; cls: string }[] = [{ key: 'f', pts: xs.map((x) => f.f(x)), cls: 'ap-f' }];
  if (rel === 'O' || rel === 'Theta') lines.push({ key: 'up', pts: xs.map((x) => w[rel === 'Theta' ? 'c2' : 'c1'] * g.f(x)), cls: 'ap-g' });
  if (rel === 'Omega' || rel === 'Theta') lines.push({ key: 'lo', pts: xs.map((x) => w.c1 * g.f(x)), cls: 'ap-g lo' });
  const finite = lines.flatMap((l) => l.pts).filter((v) => Number.isFinite(v) && v > 0);
  const maxF = Math.max(...lines[0].pts.filter(Number.isFinite), 1);
  const maxAll = Math.max(...finite, 1);
  const top = logY ? Math.log10(Math.max(...finite, 10)) : Math.max(maxF * 1.3, Math.min(maxAll * 1.05, maxF * 6));
  const X = (n: number) => L + ((n - 1) / (maxN - 1)) * (W - L - R);
  const Y = (v: number) => {
    const t = logY ? Math.log10(Math.max(v, 1e-3)) / top : v / top;
    return H - B - Math.min(Math.max(t, -0.02), 1.04) * (H - B - T);
  };
  const ticks = logY ? Array.from({ length: Math.ceil(top) + 1 }, (_, i) => i).filter((t, _, a) => a.length < 9 || t % Math.ceil(a.length / 8) === 0) : [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  const intStep = Math.max(1, Math.ceil(maxN / 60));
  const bad = Array.from({ length: Math.floor(maxN / intStep) }, (_, i) => (i + 1) * intStep).filter((n) => n >= n0 && !holdsAt(f, g, rel, w, n));

  const verdict = fail === null
    ? isTrue ? 'good' : 'fake'
    : isTrue ? 'retry' : 'impossible';

  return (
    <div className="widget card ap">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ابحث عن الشاهد: c و n₀</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((p) => <button key={p.label} className={`tt-preset ${p.f === fk && p.g === gk && p.rel === rel ? 'on' : ''}`} onClick={() => preset(p)}><span dir="ltr">{p.label}</span></button>)}
      </div>

      <div className="ap-stmt" dir="ltr">
        <select value={fk} onChange={(e) => setF(e.target.value)} aria-label="f">{FNS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
        <span>=</span>
        <div className="ap-rel">
          {(['O', 'Omega', 'Theta'] as Rel[]).map((r) => <button key={r} className={`pr-tab ${r === rel ? 'on' : ''}`} onClick={() => setRel(r)}><Tex>{REL_TEX[r]}</Tex></button>)}
        </div>
        <span>(</span>
        <select value={gk} onChange={(e) => setG(e.target.value)} aria-label="g">{FNS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
        <span>)</span>
      </div>

      <div className="ap-def">
        <Tex>{rel === 'O' ? `f(n) \\le c\\, g(n)\\ \\text{for all}\\ n \\ge n_0` : rel === 'Omega' ? `f(n) \\ge c\\, g(n)\\ \\text{for all}\\ n \\ge n_0` : `c_1 g(n) \\le f(n) \\le c_2\\, g(n)\\ \\text{for all}\\ n \\ge n_0`}</Tex>
      </div>

      <div className="ap-sliders">
        {(rel === 'Omega' || rel === 'Theta') && (
          <label><span className="ltr">{rel === 'Theta' ? 'c₁' : 'c'} = <b>{CS[ci1]}</b></span><input type="range" min={0} max={CS.length - 1} value={ci1} onChange={(e) => setC1(+e.target.value)} /></label>
        )}
        {(rel === 'O' || rel === 'Theta') && (
          <label><span className="ltr">{rel === 'Theta' ? 'c₂' : 'c'} = <b>{CS[ci2]}</b></span><input type="range" min={0} max={CS.length - 1} value={ci2} onChange={(e) => setC2(+e.target.value)} /></label>
        )}
        <label><span className="ltr">n₀ = <b>{n0}</b></span><input type="range" min={1} max={200} value={n0} onChange={(e) => setN0(+e.target.value)} /></label>
      </div>

      <div className="ps-n">
        <span className="qg-label">n حتى</span>
        {RANGES.map((r) => <button key={r} className={`tt-preset ${r === maxN ? 'on' : ''}`} onClick={() => setMax(r)}>{r.toLocaleString('en')}</button>)}
        <button className={`tt-preset ${logY ? 'on' : ''}`} onClick={() => setLogY(!logY)}>محور رأسي لوغاريتمي</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="lc-svg" style={{ direction: 'ltr' }}>
        {n0 <= maxN && <rect x={X(Math.max(n0, 1))} y={T} width={W - R - X(Math.max(n0, 1))} height={H - B - T} className="ap-zone" />}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={logY ? H - B - (t / top) * (H - B - T) : Y(t)} y2={logY ? H - B - (t / top) * (H - B - T) : Y(t)} className="gc-grid" />
            <text x={L - 6} y={(logY ? H - B - (t / top) * (H - B - T) : Y(t)) + 4} textAnchor="end" className="lc-lbl">{logY ? `10^${t}` : fmt(t < 10 ? +t.toFixed(1) : Math.round(t))}</text>
          </g>
        ))}
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} className="lc-axis" />
        <text x={L} y={H - 8} className="lc-lbl">1</text>
        <text x={W - R} y={H - 8} textAnchor="end" className="lc-lbl">n = {maxN.toLocaleString('en')}</text>
        {n0 <= maxN && <text x={X(n0) + 4} y={T + 12} className="lc-lbl ap-n0">n₀</text>}
        {lines.map((l) => <polyline key={l.key} fill="none" className={l.cls} points={xs.map((x, i) => `${X(x)},${Y(l.pts[i])}`).join(' ')} />)}
        {bad.map((n) => <circle key={n} cx={X(n)} cy={Y(f.f(n))} r={3.2} className="ap-bad" />)}
      </svg>
      <div className="gc-legend" dir="ltr">
        <span className="gc-key on"><i style={{ background: 'var(--brand)' }} />f(n) = {f.label}</span>
        {rel !== 'Omega' && <span className="gc-key on"><i style={{ background: 'var(--blue)' }} />{rel === 'Theta' ? 'c₂' : 'c'}·g(n)</span>}
        {rel !== 'O' && <span className="gc-key on"><i style={{ background: 'var(--blue)', opacity: 0.5 }} />{rel === 'Theta' ? 'c₁' : 'c'}·g(n)</span>}
        <span className="gc-key on ar"><i style={{ background: 'var(--red)' }} />نقطة تكسر الشرط</span>
      </div>

      <div className={`ap-verdict v-${verdict}`}>
        {verdict === 'good' && <>✓ <b>شاهد صالح.</b> الشرط صحيح لكل <Tex>{`n \\ge ${n0}`}</Tex>. (فحصنا كل عدد حتى 5000، ثم قفزات حتى <Tex>{'2^{60}'}</Tex>، والبرهان الجبري في الدرس يثبته لكل n.)</>}
        {verdict === 'retry' && <>✗ <b>يسقط عند <span className="ltr">n = {fmt(fail!)}</span>.</b> لكن العلاقة نفسها <b>صحيحة</b>: هذا الشاهد لا يكفي. جرّب ثابتًا {rel === 'Omega' ? 'أصغر' : 'أكبر'}، أو <Tex>{'n_0'}</Tex> أكبر.</>}
        {verdict === 'impossible' && <>✗ <b>يسقط عند <span className="ltr">n = {fmt(fail!)}</span>.</b> والعلاقة <b>خاطئة</b> أصلًا: لا يوجد أي شاهد، لأن <Tex>{`f(n)/g(n) \\to ${compareGrowth(f, g) > 0 ? '\\infty' : '0'}`}</Tex>. مهما اخترت الثوابت فستسقط لاحقًا.</>}
        {verdict === 'fake' && <>⚠ <b>صمد حتى <Tex>{'2^{60}'}</Tex></b>، لكن العلاقة <b>خاطئة</b>: الثابت كبير جدًا بالنسبة إلى الفرق في النمو، فالسقوط يأتي بعد أعداد أكبر من أن نفحصها. الفحص العددي لا يغني عن البرهان.</>}
      </div>
    </div>
  );
}

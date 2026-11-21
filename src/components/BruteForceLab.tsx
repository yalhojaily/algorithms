import { useMemo, useState } from 'react';
import { factorial, subsetFrames, tspFrames, type Pt, type SFrame, type TFrame } from '../lib/bruteforce';
import { mulberry32 } from '../lib/montecarlo';
import { Player, record, useStepper } from '../engine/stepper';

const W8 = [3, 34, 4, 12, 5, 2, 27, 9];

function Subsets() {
  const [target, setTarget] = useState(21);
  const frames = useMemo(() => record(subsetFrames(W8, target)), [target]);
  const s = useStepper<SFrame>(frames, 12);
  const f = s.frame;
  const n = W8.length;
  const setOf = (m: number) => W8.filter((_, i) => m >> i & 1);
  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">الهدف:</span>
        {[21, 30, 50, 95].map((t) => <button key={t} className={`tt-preset ${t === target ? 'on' : ''}`} onClick={() => setTarget(t)}>{t}</button>)}
      </div>
      <div className="vm-help">هل توجد مجموعة جزئية من هذه الأعداد مجموعها {target}؟ نجرّب كل المجموعات الجزئية: كل عدد ثنائي من {n} بتات مجموعة جزئية، والبت 1 يعني «خذ العنصر».</div>
      <div className="bf-items" dir="ltr">
        {W8.map((w, i) => (
          <div key={i} className={`bf-item ${f.mask >> i & 1 ? 'on' : ''}`}>
            <b>{w}</b><em>{f.mask >> i & 1}</em>
          </div>
        ))}
      </div>
      <div className="da-stats">
        <span>القناع: <bdi dir="ltr" className="ltr">{f.mask.toString(2).padStart(n, '0').split('').reverse().join('')}</bdi></span>
        <span>المجموع: <b className="ltr">{f.sum}</b></span>
        <span>جرّبنا: <b className="ltr">{f.tried}</b> من <bdi dir="ltr">2<sup>{n}</sup> = {2 ** n}</bdi></span>
      </div>
      <div className={`inv-banner ${f.hit ? 'sq-ok' : 'on'}`}>{f.hit ? `وجدنا: ${setOf(f.mask).join(' + ')} = ${target}` : f.done ? (f.hits.length ? `انتهى: ${f.hits.length} مجموعة جزئية مجموعها ${target}` : `انتهى: لا توجد أي مجموعة جزئية مجموعها ${target}، ولم نكن لنعرف ذلك دون تجربة الجميع`) : `${setOf(f.mask).join(' + ') || 'المجموعة الخالية'} = ${f.sum}`}</div>
      {f.hits.length > 0 && <div className="bf-hits" dir="ltr">{f.hits.map((m) => <span key={m}>{'{' + setOf(m).join(', ') + '}'}</span>)}</div>}
      <Player s={s} />
    </>
  );
}

function Tsp() {
  const [n, setN] = useState(6);
  const [seed, setSeed] = useState(3);
  const P = useMemo<Pt[]>(() => { const r = mulberry32(seed * 11 + n); return Array.from({ length: n }, () => [20 + r() * 360, 20 + r() * 200]); }, [n, seed]);
  const frames = useMemo(() => record(tspFrames(P), 10000), [P]);
  const s = useStepper<TFrame>(frames, n === 6 ? 8 : 40);
  const f = s.frame;
  const path = (t: number[]) => t.map((v, i) => `${i ? 'L' : 'M'}${P[v][0]},${P[v][1]}`).join(' ') + 'Z';
  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">المدن:</span>
        {[6, 7, 8].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        <button className="tt-preset" onClick={() => setSeed(seed + 1)} aria-label="مدن جديدة">🎲</button>
      </div>
      <svg className="bf-map" viewBox="0 0 400 240" direction="ltr">
        <path d={path(f.tour)} className="bf-cur" />
        {f.best.length > 0 && <path d={path(f.best)} className="bf-best" />}
        {P.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={i === 0 ? 8 : 6} className={i === 0 ? 'bf-home' : 'bf-city'} />
            <text x={p[0]} y={p[1] - 11} textAnchor="middle" className="bf-lbl">{i}</text>
          </g>
        ))}
      </svg>
      <div className="gc-legend">
        <span className="gc-key ar"><i className="bf-sw cur" /> الجولة الحالية</span>
        <span className="gc-key ar"><i className="bf-sw best" /> أفضل جولة حتى الآن</span>
      </div>
      <div className="da-stats">
        <span>الجولات: <b className="ltr">{f.tried}</b> من <bdi dir="ltr">({n} − 1)! = {factorial(n - 1)}</bdi></span>
        <span>الحالية: <b className="ltr">{f.len.toFixed(0)}</b></span>
        <span>الأفضل: <b className="ltr">{f.bestLen.toFixed(0)}</b></span>
      </div>
      <div className={`inv-banner ${f.improved ? 'sq-ok' : 'on'}`}>{f.tried === frames.length ? 'انتهى: جربنا كل الجولات، فالأفضل مضمون. ومع 20 مدينة يصير العدد 19! ≈ 1.2 × 10¹⁷ جولة' : f.improved ? 'جولة أقصر من كل ما سبق' : 'ليست أفضل'}</div>
      <Player s={s} />
    </>
  );
}

const fmt = (sec: number): string => {
  if (!isFinite(sec) || sec > 1e30) return 'لا نهائي عمليًا';
  if (sec < 1e-6) return `${(sec * 1e9).toFixed(0)} نانوثانية`;
  if (sec < 1e-3) return `${(sec * 1e6).toFixed(0)} ميكروثانية`;
  if (sec < 1) return `${(sec * 1e3).toFixed(0)} ملّي ثانية`;
  if (sec < 60) return `${sec.toFixed(1)} ثانية`;
  if (sec < 3600) return `${(sec / 60).toFixed(0)} دقيقة`;
  if (sec < 86400) return `${(sec / 3600).toFixed(0)} ساعة`;
  if (sec < 3.15e7) return `${(sec / 86400).toFixed(0)} يومًا`;
  if (sec < 3.15e11) return `${Math.round(sec / 3.15e7).toLocaleString('en')} سنة`;
  if (sec < 4.3e17) return `${(sec / 3.15e7).toExponential(1)} سنة`;
  return 'أطول من عمر الكون';
};

function Growth() {
  const [n, setN] = useState(20);
  const rows: [string, number][] = [
    ['n', n], ['n log₂ n', n * Math.log2(n)], ['n²', n ** 2], ['n³', n ** 3], ['2^n', 2 ** n], ['n!', factorial(n)],
  ];
  const OPS = 1e9;
  return (
    <>
      <div className="ap-sliders">
        <label><span>n = <b className="ltr">{n}</b></span><input type="range" min={5} max={60} value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      <div className="table-scroll">
        <table className="nice bf-growth">
          <thead><tr><th>الخطوات</th><th>العدد</th><th>الزمن بمليار خطوة في الثانية</th></tr></thead>
          <tbody>
            {rows.map(([name, v]) => {
              const t = v / OPS;
              return (
                <tr key={name} className={t > 60 ? 'slow' : t > 1 ? 'meh' : ''}>
                  <td dir="ltr">{name === '2^n' ? <>2<sup>n</sup></> : name}</td>
                  <td dir="ltr" className="ltr">{v < 1e12 ? Math.round(v).toLocaleString('en') : v.toExponential(2)}</td>
                  <td>{fmt(t)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="vm-help">حرّك n من 20 إلى 30: سطر <bdi dir="ltr">2<sup>n</sup></bdi> يتضاعف ألف مرة، وسطر <bdi dir="ltr">n!</bdi> يقفز من ساعات إلى ما لا ينتهي. والحاسوب الأسرع بألف مرة لا يضيف إلى <bdi dir="ltr">2<sup>n</sup></bdi> إلا عشرة عناصر.</div>
    </>
  );
}

/** Exhaustive search made visible: subset sum over all masks, TSP over all tours, and a growth table. */
export default function BruteForceLab() {
  const [tab, setTab] = useState<'sub' | 'tsp' | 'grow'>('sub');
  return (
    <div className="widget card bf">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جرّب كل شيء</span>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${tab === 'sub' ? 'on' : ''}`} onClick={() => setTab('sub')}>المجموعات الجزئية</button>
        <button className={`pr-tab ${tab === 'tsp' ? 'on' : ''}`} onClick={() => setTab('tsp')}>البائع المتجول</button>
        <button className={`pr-tab ${tab === 'grow' ? 'on' : ''}`} onClick={() => setTab('grow')}>كم يستغرق؟</button>
      </div>
      {tab === 'sub' ? <Subsets /> : tab === 'tsp' ? <Tsp /> : <Growth />}
    </div>
  );
}

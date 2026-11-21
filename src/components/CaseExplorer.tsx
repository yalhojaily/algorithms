import { useMemo, useState } from 'react';
import { CASE_ALGOS, EXACT_MAX, distribution } from '../lib/cases';
import { Tex } from './MathText';

const fact = (n: number) => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };
const f2 = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

/** Run an algorithm on every permutation (or a random sample) and look at the whole distribution of its cost. */
export default function CaseExplorer() {
  const [key, setKey] = useState('ins');
  const [n, setN] = useState(5);
  const [pick, setPick] = useState<number | null>(null);
  const A = CASE_ALGOS.find((a) => a.key === key)!;
  const d = useMemo(() => distribution(A, n), [A, n]);

  const lo = A.best.f(n), hi = A.worst.f(n);
  const span = Math.max(hi - lo, 1);
  const nb = Math.min(span + 1, 56);
  const bw = (span + 1) / nb; // cost units per bin
  const bins = Array.from({ length: nb }, () => 0);
  const binOf = (c: number) => Math.min(nb - 1, Math.floor((c - lo) / bw));
  d.hist.forEach((cnt, c) => { bins[binOf(c)] += cnt; });
  const top = Math.max(...bins, 1);

  const W = 560, H = 210, L = 12, R = 12, T = 22, B = 34;
  const X = (c: number) => L + ((c - lo + 0.5) / (span + 1)) * (W - L - R);
  const colW = (W - L - R) / nb;
  const marks: { v: number; cls: string; label: string }[] = [
    { v: lo, cls: 'best', label: 'الأفضل' },
    { v: A.avg.f(n), cls: 'avg', label: 'المتوسط' },
    { v: hi, cls: 'worst', label: 'الأسوأ' },
  ];

  const chosen = pick !== null ? [...d.example.entries()].filter(([c]) => binOf(c) === pick).sort((a, b) => a[0] - b[0])[0] : null;
  const choose = (k: string) => { setKey(k); setPick(null); };

  return (
    <div className="widget card cx">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">كل المدخلات معًا: توزيع التكلفة</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {CASE_ALGOS.map((a) => <button key={a.key} className={`pr-tab ${a.key === key ? 'on' : ''}`} onClick={() => choose(a.key)}>{a.label}</button>)}
      </div>
      <div className="ct-size">
        <label>
          <span className="qg-label">n = <b className="ltr">{n}</b></span>
          <input type="range" min={2} max={40} value={n} onChange={(e) => { setN(+e.target.value); setPick(null); }} />
        </label>
        <span className="ct-note">
          {d.exact
            ? <>كل التباديل: <b className="ltr">{n}! = {fact(n).toLocaleString('en')}</b> مدخلًا</>
            : <>عينة عشوائية من <b className="ltr">{d.samples.toLocaleString('en')}</b> تبديل (عددها كلها <span className="ltr">{fact(n) > 1e15 ? `≈ ${fact(n).toExponential(1)}` : fact(n).toLocaleString('en')}</span>)</>}
        </span>
      </div>

      <div className="tt-side">
        <pre className="cx-code" dir="ltr">{A.pseudo.join('\n')}</pre>
        <div className="cx-stats">
          <div className="cx-unit">نعدّ: {A.unit}</div>
          {[
            { k: 'best', name: 'أفضل حالة', tex: A.best.tex, v: lo, seen: d.min, input: A.best.input },
            { k: 'avg', name: 'متوسط الحالة', tex: A.avg.tex, v: A.avg.f(n), seen: d.mean, input: d.exact ? 'متوسط كل التباديل' : 'متوسط العينة' },
            { k: 'worst', name: 'أسوأ حالة', tex: A.worst.tex, v: hi, seen: d.max, input: A.worst.input },
          ].map((s) => (
            <div key={s.k} className={`cx-stat ${s.k}`}>
              <div className="cx-stat-h"><span>{s.name}</span><Tex>{s.tex}</Tex></div>
              <div className="cx-stat-v"><span>الصيغة: <b>{f2(s.v)}</b></span><span>{d.exact ? 'المرصود' : 'في العينة'}: <b>{f2(s.seen)}</b></span></div>
              <div className="cx-stat-i">{s.input}</div>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="lc-svg cx-hist" style={{ direction: 'ltr' }}>
        {bins.map((cnt, i) => {
          const h = (cnt / top) * (H - T - B);
          return <rect key={i} x={L + i * colW + 1} y={H - B - h} width={Math.max(colW - 2, 1)} height={Math.max(h, cnt ? 1.5 : 0)} className={`cx-bar ${pick === i ? 'on' : ''}`} onClick={() => cnt && setPick(i)} style={{ cursor: cnt ? 'pointer' : 'default' }} />;
        })}
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} className="lc-axis" />
        {marks.map((m, i) => (
          <g key={m.cls}>
            <line x1={X(m.v)} x2={X(m.v)} y1={T - 4} y2={H - B + 4} className={`cx-mark ${m.cls}`} />
            <text x={X(m.v)} y={H - B + 18 + (i === 1 ? 12 : 0)} textAnchor="middle" className={`lc-lbl cx-mk ${m.cls}`}>{f2(m.v)}</text>
          </g>
        ))}
      </svg>
      <div className="gc-legend">
        <span className="gc-key on ar"><i style={{ background: 'var(--green)' }} />أفضل حالة</span>
        <span className="gc-key on ar"><i style={{ background: 'var(--amber)' }} />المتوسط</span>
        <span className="gc-key on ar"><i style={{ background: 'var(--red)' }} />أسوأ حالة</span>
      </div>

      <div className="cx-pick">
        {chosen
          ? <>مدخل كلّف <b className="ltr">{chosen[0]}</b>: <code dir="ltr">[{chosen[1].join(', ')}]</code></>
          : <>اضغط أي عمود لترى مدخلًا من تلك التكلفة.</>}
      </div>
      {!d.exact && d.max < hi && (
        <div className="vm-help">لم تظهر أسوأ حالة في العينة: احتمال أن يكون تبديل عشوائي هو المدخل الأسوأ بالضبط <bdi dir="ltr">1/{n}!</bdi> أو قريب منه. فالأسوأ نادر جدًا، لكنه ممكن، ومدخل «مرتب» يكفي لإحداثه.</div>
      )}
    </div>
  );
}

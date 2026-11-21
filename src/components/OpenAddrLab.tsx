import { useMemo, useState } from 'react';
import { TOMB, makeHash, oaDelete, oaFind, oaInsert, theory, type Cell, type Probe } from '../lib/hashing';
import { mulberry32 } from '../lib/montecarlo';

const M = 32;
const PROBES: { k: Probe; label: string }[] = [
  { k: 'linear', label: 'خطي: h + i' },
  { k: 'quadratic', label: 'تربيعي: h + i(i+1)/2' },
  { k: 'double', label: 'مزدوج: h₁ + i·h₂' },
];

/** Open addressing on a 32-cell table: probe paths, tombstones, clusters and the expected-probes curves. */
export default function OpenAddrLab() {
  const [probe, setProbe] = useState<Probe>('linear');
  const [seed, setSeed] = useState(3);
  const fn = useMemo(() => makeHash('universal', seed), [seed]);
  const [table, setTable] = useState<Cell[]>(Array(M).fill(null));
  const [path, setPath] = useState<number[]>([]);
  const [msg, setMsg] = useState('أدرج مفاتيح، ثم ابحث عن مفتاح أو احذفه، وراقب مسار التجريب.');
  const [inp, setInp] = useState('');
  const rnd = useMemo(() => mulberry32(seed * 7 + 1), [seed]);

  const keys = table.filter((c) => c !== null && c !== TOMB) as number[];
  const n = keys.length, tombs = table.filter((c) => c === TOMB).length;
  const alpha = n / M;

  const measured = useMemo(() => {
    if (!n) return { hit: 0, miss: 0 };
    const hit = keys.reduce((s, k) => s + oaFind(table, k, probe, fn).path.length, 0) / n;
    const r = mulberry32(99);
    let miss = 0, cnt = 0;
    while (cnt < 300) { const k = 200000 + Math.floor(r() * 800000); miss += oaFind(table, k, probe, fn).path.length; cnt++; }
    return { hit, miss: miss / cnt };
  }, [table, probe, fn]);

  const reset = (p = probe) => { setProbe(p); setTable(Array(M).fill(null)); setPath([]); setMsg('جدول فارغ.'); };
  const insert = (k: number) => {
    if (n >= M) { setMsg('الجدول ممتلئ: العنونة المفتوحة تحتاج إلى α < 1.'); return; }
    const r = oaInsert(table, k, probe, fn);
    setTable(r.table); setPath(r.path);
    setMsg(r.found ? `${k} موجود أصلًا (${r.path.length} تجربة).` : `أُدرج ${k} في الخانة ${r.placed} بعد ${r.path.length} تجربة.`);
  };
  const fill = (target: number) => {
    let t = table;
    let guard = 0;
    while (t.filter((c) => c !== null && c !== TOMB).length < target && guard++ < 500) t = oaInsert(t, Math.floor(rnd() * 1000), probe, fn).table;
    setTable(t); setPath([]); setMsg(`ملأنا الجدول حتى α = ${(target / M).toFixed(2)}.`);
  };
  const num = () => { const v = parseInt(inp, 10); return Number.isFinite(v) && v >= 0 && v < 1000000 ? v : null; };

  // chart
  const W = 560, H = 190, L = 34, B = 24, T = 10, R = 10, YMAX = 12;
  const X = (a: number) => L + (a / 0.95) * (W - L - R);
  const Y = (v: number) => H - B - (Math.min(v, YMAX) / YMAX) * (H - B - T);
  const curve = (f: (a: number) => number) => Array.from({ length: 96 }, (_, i) => i / 100).map((a) => `${X(a)},${Y(f(a))}`).join(' ');

  return (
    <div className="widget card oa">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">العنونة المفتوحة: مسارات التجريب والتكتل</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {PROBES.map((p) => <button key={p.k} className={`pr-tab ${p.k === probe ? 'on' : ''}`} onClick={() => reset(p.k)}><span dir="ltr">{p.label}</span></button>)}
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <input className="oa-in" dir="ltr" inputMode="numeric" placeholder="مفتاح" value={inp} onChange={(e) => setInp(e.target.value)} />
        <button className="btn btn-sm" onClick={() => { const k = num(); if (k !== null) insert(k); }}>insert</button>
        <button className="btn btn-sm" onClick={() => { const k = num(); if (k === null) return; const r = oaFind(table, k, probe, fn); setPath(r.path); setMsg(`${r.found ? 'وُجد' : 'غير موجود'} بعد ${r.path.length} تجربة.`); }}>find</button>
        <button className="btn btn-sm" onClick={() => { const k = num(); if (k === null) return; const r = oaDelete(table, k, probe, fn); setTable(r.table); setPath(r.path); setMsg(r.found ? `حُذف ${k} ووُضع شاهد قبر † مكانه.` : `${k} غير موجود.`); }}>delete</button>
        <button className="btn btn-sm" onClick={() => insert(Math.floor(rnd() * 1000))}>مفتاح عشوائي</button>
        {[0.5, 0.75, 0.9].map((a) => <button key={a} className="btn btn-sm" onClick={() => fill(Math.round(a * M))}>املأ حتى {a}</button>)}
        <button className="btn btn-sm" onClick={() => reset()}>↺</button>
        <button className="btn btn-sm" onClick={() => { setSeed(seed + 1); reset(); }} title="دالة تجزئة جديدة">🎲</button>
      </div>

      <div className="oa-cells" dir="ltr">
        {table.map((c, i) => {
          const step = path.indexOf(i);
          return (
            <div key={i} className={`oa-cell ${c === TOMB ? 'tomb' : c !== null ? 'full' : ''} ${step >= 0 ? 'path' : ''} ${step === path.length - 1 && step >= 0 ? 'end' : ''}`}>
              <span className="oa-v">{c === null ? '' : String(c)}</span>
              <span className="oa-i">{i}</span>
              {step >= 0 && <span className="oa-step">{step + 1}</span>}
            </div>
          );
        })}
      </div>
      <div className="inv-banner on">{msg}</div>

      <div className="da-stats">
        <div><span>n</span><b>{n}</b></div>
        <div><span>α = n/m</span><b>{alpha.toFixed(2)}</b></div>
        <div><span>شواهد القبور †</span><b>{tombs}</b></div>
        <div><span>متوسط التجارب: بحث ناجح</span><b>{measured.hit.toFixed(2)}</b></div>
        <div><span>متوسط التجارب: بحث فاشل</span><b>{measured.miss.toFixed(2)}</b></div>
      </div>

      <div className="ct-dom-title">العدد المتوقع للتجارب مقابل α</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="lc-svg" style={{ direction: 'ltr' }}>
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} className="lc-axis" />
        {[0, 0.25, 0.5, 0.75, 0.95].map((a) => <text key={a} x={X(a)} y={H - 6} textAnchor="middle" className="lc-lbl">{a}</text>)}
        {[1, 4, 8, 12].map((v) => <g key={v}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="gc-grid" /><text x={L - 4} y={Y(v) + 4} textAnchor="end" className="lc-lbl">{v}</text></g>)}
        <polyline fill="none" className="oa-c lm" points={curve(theory.linearMiss)} />
        <polyline fill="none" className="oa-c lh" points={curve(theory.linearHit)} />
        <polyline fill="none" className="oa-c um" points={curve(theory.uniformMiss)} />
        {n > 0 && <>
          <line x1={X(alpha)} x2={X(alpha)} y1={T} y2={H - B} className="oa-now" />
          <circle cx={X(alpha)} cy={Y(measured.miss)} r={5} className="oa-pt miss" />
          <circle cx={X(alpha)} cy={Y(measured.hit)} r={5} className="oa-pt hit" />
        </>}
      </svg>
      <div className="gc-legend">
        <span className="gc-key on ar"><i style={{ background: 'var(--brand)' }} />خطي، بحث فاشل ½(1 + 1/(1−α)²)</span>
        <span className="gc-key on ar"><i style={{ background: 'var(--amber)' }} />خطي، بحث ناجح ½(1 + 1/(1−α))</span>
        <span className="gc-key on ar"><i style={{ background: 'var(--blue)' }} />تجزئة منتظمة، بحث فاشل 1/(1−α)</span>
      </div>
      <div className="vm-help">النقطتان قياسك الحالي (الحمراء للفاشل، والبرتقالية للناجح). مع 32 خانة فقط يتذبذب القياس، لكن الشكل واضح: كل المنحنيات تنفجر حين يقترب α من 1.</div>
    </div>
  );
}

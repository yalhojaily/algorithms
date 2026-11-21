import { useMemo, useState } from 'react';
import { Q_PSEUDO, quickFrames, type PivotRule, type QFrame, type Scheme } from '../lib/quicksort';
import { makeArr, type InputKind } from '../lib/sortrace';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

const KINDS: { k: InputKind; label: string }[] = [
  { k: 'random', label: 'عشوائية' },
  { k: 'sorted', label: 'مرتبة' },
  { k: 'reversed', label: 'معكوسة' },
  { k: 'few', label: 'قيم مكررة' },
];
const RULES: { k: PivotRule; label: string }[] = [
  { k: 'last', label: 'الأخير' },
  { k: 'random', label: 'عشوائي' },
  { k: 'median3', label: 'وسيط ثلاثة' },
];

/** Quicksort step by step: Lomuto or three-way partition, three pivot rules, comparison and depth counters. */
export default function QuickSortLab() {
  const [scheme, setScheme] = useState<Scheme>('lomuto');
  const [rule, setRule] = useState<PivotRule>('last');
  const [kind, setKind] = useState<InputKind>('random');
  const [n, setN] = useState(16);
  const [seed, setSeed] = useState(3);
  const A = useMemo(() => makeArr(kind, n, seed), [kind, n, seed]);
  const frames = useMemo(() => record(quickFrames(A, scheme, rule, seed)), [A, scheme, rule, seed]);
  const s = useStepper<QFrame>(frames, 4);
  const f = s.frame;
  const total = frames[frames.length - 1];
  const maxV = Math.max(...A);
  const nlogn = Math.round(n * Math.log2(n));
  const quad = (n * (n - 1)) / 2;

  const cls = (i: number): string => {
    const out: string[] = [];
    if (f.done || f.fixed[i]) out.push('ok');
    if (i < f.lo || i > f.hi) out.push('out');
    else if (scheme === 'lomuto') {
      if (i === f.p) out.push('piv');
      else if (f.i >= 0 && i < f.i) out.push('lt');
      else if (f.j >= 0 && i < f.j) out.push('ge');
      if (i === f.j) out.push('cmp');
    } else if (f.pv !== null && f.i >= 0) {
      if (i < f.j) out.push('lt');
      else if (i < f.i) out.push('eq');
      else if (i > f.gt) out.push('ge');
      if (i === f.i && f.i <= f.gt) out.push('cmp');
    }
    return out.join(' ');
  };

  return (
    <div className="widget card qs">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الترتيب السريع: التقسيم والمحور</span>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${scheme === 'lomuto' ? 'on' : ''}`} onClick={() => setScheme('lomuto')}>تقسيم Lomuto</button>
        <button className={`pr-tab ${scheme === 'three' ? 'on' : ''}`} onClick={() => setScheme('three')}>تقسيم ثلاثي</button>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">المحور:</span>
        {RULES.map((r) => <button key={r.k} className={`tt-preset ${r.k === rule ? 'on' : ''}`} onClick={() => setRule(r.k)}>{r.label}</button>)}
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">المدخل:</span>
        {KINDS.map((x) => <button key={x.k} className={`tt-preset ${x.k === kind ? 'on' : ''}`} onClick={() => setKind(x.k)}>{x.label}</button>)}
        <span className="qg-label">n =</span>
        {[16, 24].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        <button className="tt-preset" onClick={() => setSeed(seed + 1)} aria-label="مدخل جديد">🎲</button>
      </div>

      <div className="qs-bars" dir="ltr">
        {f.arr.map((v, i) => (
          <div key={i} className={`qs-col ${cls(i)}`}>
            <i style={{ height: `${(v / maxV) * 100}%` }} />
            <span>{v}</span>
          </div>
        ))}
      </div>

      <div className="da-stats">
        <span>المقارنات: <b className="ltr">{f.comps}</b> / <b className="ltr">{total.comps}</b></span>
        <span>عمق الاستدعاء: <b className="ltr">{f.depth}</b>، الأقصى <b className="ltr">{total.maxDepth}</b></span>
        <span>للمقارنة: <bdi dir="ltr">n log₂ n ≈ {nlogn}</bdi></span>
        <span>أسوأ حالة: <bdi dir="ltr">n(n−1)/2 = {quad}</bdi></span>
      </div>

      <div className="gc-legend">
        <span className="gc-key ar"><i className="qs-sw piv" /> المحور</span>
        <span className="gc-key ar"><i className="qs-sw lt" /> أصغر من المحور</span>
        {scheme === 'three' && <span className="gc-key ar"><i className="qs-sw eq" /> يساوي المحور</span>}
        <span className="gc-key ar"><i className="qs-sw ge" /> {scheme === 'three' ? 'أكبر' : 'أكبر أو يساوي'}</span>
        <span className="gc-key ar"><i className="qs-sw cmp" /> يُقارن الآن</span>
        <span className="gc-key ar"><i className="qs-sw ok" /> في مكانه النهائي</span>
      </div>

      <div className="tt-side">
        <Pseudocode lines={Q_PSEUDO[scheme]} active={f.line} />
        <div className="tt-info"><div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}>{f.note}</div></div>
      </div>
      <Player s={s} />
    </div>
  );
}

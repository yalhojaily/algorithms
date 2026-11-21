import { useMemo, useState } from 'react';
import { COUNT_PSEUDO, countingFrames, digit, radixFrames, type CFrame, type RFrame } from '../lib/linearsort';
import { mulberry32 } from '../lib/montecarlo';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

function Counting({ seed }: { seed: number }) {
  const k = 10;
  const A = useMemo(() => { const r = mulberry32(seed); return Array.from({ length: 12 }, () => Math.floor(r() * k)); }, [seed]);
  const frames = useMemo(() => record(countingFrames(A, k)), [A]);
  const s = useStepper<CFrame>(frames, 3);
  const f = s.frame;
  const cHl = f.phase === 'prefix' ? f.at : (f.phase === 'count' || f.phase === 'place') && f.at >= 0 ? A[f.at] : -1;
  return (
    <>
      <div className="ls-rows" dir="ltr">
        <div className="ls-row"><span className="ls-name">A</span>{A.map((v, i) => <span key={i} className={`ls-cell ${i === f.at && f.phase !== 'prefix' ? 'hl' : ''} ${f.phase === 'place' && i > f.at ? 'gone' : ''} ${f.phase === 'done' ? 'gone' : ''}`}>{v}<em>{i}</em></span>)}</div>
        <div className="ls-row"><span className="ls-name">C</span>{f.C.map((v, i) => <span key={i} className={`ls-cell c ${i === cHl ? 'hl' : ''}`}>{v}<em>{i}</em></span>)}</div>
        <div className="ls-row"><span className="ls-name">OUT</span>{f.out.map((v, i) => <span key={i} className={`ls-cell ${v === null ? 'empty' : 'ok'} ${i === f.wrote ? 'hl' : ''}`}>{v ?? ''}<em>{i}</em></span>)}</div>
      </div>
      <div className="tt-side">
        <Pseudocode lines={COUNT_PSEUDO} active={f.line} />
        <div className="tt-info"><div className={`inv-banner ${f.phase === 'done' ? 'sq-ok' : 'on'}`}>{f.note}</div></div>
      </div>
      <Player s={s} />
    </>
  );
}

function Radix({ seed }: { seed: number }) {
  const A = useMemo(() => {
    const r = mulberry32(seed + 100);
    return Array.from({ length: 10 }, (_, i) => (i === 3 ? Math.floor(r() * 10) : i === 7 ? 10 + Math.floor(r() * 90) : 100 + Math.floor(r() * 900)));
  }, [seed]);
  const frames = useMemo(() => record(radixFrames(A, 3)), [A]);
  const s = useStepper<RFrame>(frames, 3);
  const f = s.frame;
  const num = (x: number, hl: boolean) => (
    <span className="ls-num">{[2, 1, 0].map((d) => <b key={d} className={d === f.pass ? 'dg' : d < f.pass ? 'dn' : ''}>{d > 0 && x < 10 ** d ? '0' : digit(x, d)}</b>)}{hl && <i />}</span>
  );
  const show = f.collected ?? f.arr;
  return (
    <>
      <div className="ls-rows" dir="ltr">
        <div className="ls-cap" dir="rtl">{f.collected ? "بعد التجميع" : "الترتيب الحالي"}</div>
        <div className="ls-row wrap">{show.map((x, i) => <span key={i} className={`ls-chip ${f.collected === null && i === f.at ? 'hl' : ''} ${f.collected === null && i < f.at ? 'gone' : ''}`}>{num(x, false)}</span>)}</div>
      </div>
      {f.pass < 3 && (
        <div className="ls-buckets" dir="ltr">
          {f.buckets.map((b, d) => (
            <div key={d} className="ls-bucket">
              <div className="ls-stack">{b.map((x, t) => <span key={t} className="ls-chip sm">{num(x, false)}</span>)}</div>
              <div className="ls-blbl">{d}</div>
            </div>
          ))}
        </div>
      )}
      <div className={`inv-banner ${f.pass === 3 ? 'sq-ok' : 'on'}`}>{f.note}</div>
      <div className="vm-help">الخانة الملونة هي التي نرتب بها في هذا المرور، والخانات الباهتة على يمينها رُتّبت في المرورات السابقة. داخل كل دلو يبقى ترتيب الوصول: هذا هو الثبات، وبدونه يضيع عمل المرورات السابقة.</div>
      <Player s={s} />
    </>
  );
}

/** Counting sort and LSD radix sort, step by step. */
export default function LinearSortLab() {
  const [tab, setTab] = useState<'count' | 'radix'>('count');
  const [seed, setSeed] = useState(5);
  return (
    <div className="widget card lin">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الترتيب دون مقارنة</span>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${tab === 'count' ? 'on' : ''}`} onClick={() => setTab('count')}>Counting Sort</button>
        <button className={`pr-tab ${tab === 'radix' ? 'on' : ''}`} onClick={() => setTab('radix')}>Radix Sort</button>
        <button className="tt-preset" onClick={() => setSeed(seed + 1)} aria-label="مدخل جديد">🎲</button>
      </div>
      {tab === 'count' ? <Counting seed={seed} /> : <Radix seed={seed} />}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Player, Pseudocode, useStepper } from '../engine/stepper';

const PSEUDO = [
  'GUESS(N, secret):          // secret in 1..N',
  '  lo ← 1; hi ← N; q ← 0',
  '  while lo < hi:',
  '    mid ← ⌊(lo + hi) / 2⌋; q ← q + 1',
  '    if secret ≤ mid: hi ← mid   // "is it ≤ mid?" yes',
  '    else: lo ← mid + 1                        // no',
  '  return lo                 // q ≤ ⌈log₂ N⌉',
];

interface Frame { lo: number; hi: number; mid?: number; q: number; line: number; yes?: boolean }

function run(N: number, secret: number): Frame[] {
  const out: Frame[] = [{ lo: 1, hi: N, q: 0, line: 2 }];
  let lo = 1, hi = N, q = 0;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    q++;
    const yes = secret <= mid;
    out.push({ lo, hi, mid, q, line: 4 });
    if (yes) hi = mid; else lo = mid + 1;
    out.push({ lo, hi, mid, q, line: yes ? 5 : 6, yes });
  }
  out.push({ lo, hi, q, line: 7 });
  return out;
}

const SIZES = [16, 1000, 1_000_000, 1_000_000_000];

/** "Guess my number" with yes/no questions: each answer halves the interval, so N needs only ⌈log₂ N⌉ questions. */
export default function HalvingGame() {
  const [N, setN] = useState(1000);
  const [secret, setSecret] = useState(737);
  const sec = Math.min(Math.max(1, secret), N);
  const frames = useMemo(() => run(N, sec), [N, sec]);
  const s = useStepper<Frame>(frames, 2);
  const fr = s.frame;
  const fmt = (x: number) => x.toLocaleString('en');
  const pct = (x: number) => ((x - 1) / Math.max(N - 1, 1)) * 100;
  const size = fr.hi - fr.lo + 1;

  return (
    <div className="widget card hg">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">خمّن العدد: كل سؤال ينصّف الاحتمالات</span>
      </div>
      <div className="ps-n">
        <span className="qg-label">N =</span>
        {SIZES.map((v) => (
          <button key={v} className={`tt-preset ${v === N ? 'on' : ''}`} onClick={() => { setN(v); setSecret(Math.max(1, Math.floor(v * 0.737))); }}>
            <span className="ltr">{fmt(v)}</span>
          </button>
        ))}
        <label className="qg-label hg-secret">العدد السري:
          <input type="number" min={1} max={N} value={sec} onChange={(e) => setSecret(Number(e.target.value) || 1)} dir="ltr" />
        </label>
      </div>

      <div className="hg-bar" dir="ltr">
        <div className="hg-range" style={{ left: `${pct(fr.lo)}%`, width: `${Math.max(pct(fr.hi) - pct(fr.lo), 0.4)}%` }} />
        {fr.mid !== undefined && fr.line === 4 && <div className="hg-mid" style={{ left: `${pct(fr.mid)}%` }} />}
        <div className="hg-secret-mark" style={{ left: `${pct(sec)}%` }} title="العدد السري" />
      </div>
      <div className="hg-ends ltr"><span>1</span><span>{fmt(N)}</span></div>

      <div className="hg-stats">
        <div><span>المدى الحالي</span><b className="ltr">[{fmt(fr.lo)}, {fmt(fr.hi)}]</b></div>
        <div><span>عدد الاحتمالات الباقية</span><b className="ltr">{fmt(size)}</b></div>
        <div><span>الأسئلة حتى الآن</span><b className="ltr">{fr.q}</b></div>
        <div><span>الحد الأقصى ⌈log₂ N⌉</span><b className="ltr">{Math.ceil(Math.log2(N))}</b></div>
      </div>

      <div className="tt-side">
        <Pseudocode lines={PSEUDO} active={fr.line} />
        <div className="tt-info">
          <div className="tt-note" aria-live="polite">
            {fr.line === 4 && <>السؤال {fr.q}: هل العدد ≤ <span className="ltr">{fmt(fr.mid!)}</span>؟</>}
            {(fr.line === 5 || fr.line === 6) && <>{fr.yes ? 'نعم' : 'لا'}، فبقي <span className="ltr">{fmt(size)}</span> احتمالًا، أي نحو النصف.</>}
            {fr.line === 2 && <>كل الأعداد من 1 إلى <span className="ltr">{fmt(N)}</span> محتملة.</>}
            {fr.line === 7 && <>العدد هو <b className="ltr">{fmt(fr.lo)}</b>، وجدناه بعد <b>{fr.q}</b> سؤالًا فقط.</>}
          </div>
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

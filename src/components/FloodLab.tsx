import { useMemo, useState } from 'react';
import { blobImage, floodFrames, type FFrame } from '../lib/bookgraphs';
import { Player, useStepper } from '../engine/stepper';

const COLORS = ['var(--blue-soft)', 'var(--olive)', 'var(--amber)', 'var(--card)', 'var(--brand)'];
const NAMES = ['أزرق فاتح', 'زيتوني', 'كهرماني', 'أبيض', 'أحمر'];
const R = 14, C = 18;

/** Flood fill = reachability in the graph of same-colour neighbouring pixels. Click a pixel to pour paint. */
export default function FloodLab() {
  const [seed, setSeed] = useState(4);
  const [base, setBase] = useState<number[][]>(() => blobImage(R, C, 4, 4));
  const [hit, setHit] = useState<[number, number] | null>(null);
  const [color, setColor] = useState(4);
  const [bag, setBag] = useState<'stack' | 'queue'>('queue');
  const frames = useMemo<FFrame[]>(() => (hit ? floodFrames(base, hit[0], hit[1], color, bag) : [{ img: base, cur: null, filled: 0, bag: 0 }]), [base, hit, color, bag]);
  const s = useStepper<FFrame>(frames, 12);
  const f = s.frame;
  const click = (i: number, j: number) => { setBase(frames.at(-1)!.img); setHit([i, j]); };
  const region = hit ? frames.at(-1)!.filled : 0;
  return (
    <div className="widget card fl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">علبة الطلاء</span>
      </div>
      <div className="rel-tabs wf-tabs">
        {COLORS.map((c, k) => (
          <button key={k} className={`fl-sw ${color === k ? 'on' : ''}`} style={{ background: c }} title={NAMES[k]} aria-label={NAMES[k]} onClick={() => setColor(k)} />
        ))}
        <button className={`pr-tab ${bag === 'queue' ? 'on' : ''}`} onClick={() => setBag('queue')}>طابور</button>
        <button className={`pr-tab ${bag === 'stack' ? 'on' : ''}`} onClick={() => setBag('stack')}>مكدس</button>
        <button className="btn btn-sm" onClick={() => { const z = seed + 1; setSeed(z); setBase(blobImage(R, C, 4, z)); setHit(null); }}>صورة أخرى</button>
      </div>
      <div className="vm-help">اختر لونًا، ثم انقر أي بكسل. الطلاء ينتشر إلى الجيران الأربعة من اللون نفسه فقط.</div>
      <div className="fl-grid" dir="ltr" style={{ gridTemplateColumns: `repeat(${C}, 1fr)` }}>
        {f.img.map((row, i) => row.map((x, j) => (
          <button key={`${i},${j}`} className={`fl-px ${f.cur && f.cur[0] === i && f.cur[1] === j ? 'cur' : ''} ${hit && hit[0] === i && hit[1] === j ? 'seed' : ''}`}
            style={{ background: COLORS[x] }} onClick={() => click(i, j)} aria-label={`${i},${j}`} />
        )))}
      </div>
      <div className="da-stats">
        <span>مُلئ: <b className="ltr">{f.filled}</b>{hit ? <> من {region}</> : null}</span>
        <span>في الحقيبة: <b className="ltr">{f.bag}</b></span>
        <span>كل البكسلات: <bdi dir="ltr">{R} × {C} = {R * C}</bdi></span>
      </div>
      <div className="edl-msg">
        {!hit ? 'انقر بكسلًا لتبدأ.' : region === 0 ? 'البكسل بهذا اللون أصلًا: لا شيء يتغير.'
          : <>الزمن يتناسب مع حجم المنطقة ({region} بكسلًا)، لا مع حجم الصورة كلها. {bag === 'queue' ? 'بالطابور ينتشر الطلاء حلقات حول نقطة البداية.' : 'بالمكدس يندفع في اتجاه واحد حتى يصطدم، ثم يرجع.'}</>}
      </div>
      <Player s={s} />
    </div>
  );
}

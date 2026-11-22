import { useMemo, useState } from 'react';
import { lisWitness, PI_DIGITS } from '../lib/lis';
import { lisFirstFrames, type LTFrame } from '../lib/dp';
import { Player, useStepper } from '../engine/stepper';

/** FastLIS2: LISfirst[0..n] filled right to left; the inner loop scans every later index. */
export default function LISTableLab() {
  const [n, setN] = useState(10);
  const A = PI_DIGITS.slice(0, n);
  const frames = useMemo(() => lisFirstFrames(A), [n]);
  const s = useStepper<LTFrame>(frames, 12);
  const f = s.frame;
  const B = ['−∞', ...A.map(String)];
  const wit = new Set(lisWitness(A).map((i) => i + 1));
  const done = f.i < 0;
  return (
    <div className="widget card ltb">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول LISfirst: من اليمين، وكل خانة تسأل كل ما بعدها</span>
      </div>
      <div className="ap-sliders">
        <label><span>أول <b>{n}</b> أرقام من π</span><input type="range" min={4} max={16} value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      <div className="ltb-grid" dir="ltr">
        {B.map((x, i) => {
          const cand = f.j > 0 && i === f.j;
          const ok = cand && (i === 0 ? false : (A[i - 1] > (f.i === 0 ? -Infinity : A[f.i - 1])));
          return (
            <div key={i} className={`ltb-c ${i === f.i ? 'cur' : ''} ${cand ? (ok ? 'ok' : 'no') : ''} ${done && wit.has(i) ? 'wit' : ''}`}>
              <small>{i}</small>
              <span className="ltb-a">{x}</span>
              <span className="ltb-l">{f.L[i] ?? '·'}</span>
            </div>
          );
        })}
      </div>
      <div className="ltb-msg">
        {done ? <>الجواب <bdi dir="ltr">LISfirst[0] − 1 = {f.best}</bdi>. والمتتالية المظللة واحدة من أطول المتتاليات.</>
          : f.j < 0 ? <>نبدأ الخانة <bdi dir="ltr">i = {f.i}</bdi> بالقيمة 1: المتتالية التي فيها <bdi dir="ltr">A[{f.i}]</bdi> وحده.</>
          : <>هل <bdi dir="ltr">A[{f.j}] = {B[f.j]} &gt; A[{f.i}] = {B[f.i]}</bdi>؟ إن نعم، نجرب <bdi dir="ltr">1 + LISfirst[{f.j}]</bdi>.</>}
      </div>
      <div className="da-stats">
        <span>المقارنات حتى الآن: <b className="ltr">{frames.indexOf(f)}</b></span>
        <span>المجموع <bdi dir="ltr">≈ n²/2</bdi>: <b className="ltr">{frames.length - 2}</b></span>
      </div>
      <Player s={s} />
    </div>
  );
}

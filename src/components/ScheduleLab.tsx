import { useMemo, useState } from 'react';
import { maxSchedule, randomClasses, scheduleFrames, type SchedFrame } from '../lib/greedy';
import { Player, useStepper } from '../engine/stepper';

/** GreedySchedule: classes sorted by finish time; take each class that starts after the last one taken ends. */
export default function ScheduleLab() {
  const [seed, setSeed] = useState(3);
  const [n, setN] = useState(12);
  const cls = useMemo(() => randomClasses(n, seed), [n, seed]);
  const { order, frames } = useMemo(() => scheduleFrames(cls), [cls]);
  const opt = useMemo(() => maxSchedule(cls), [cls]);
  const s = useStepper<SchedFrame>(frames, 2);
  const f = s.frame;
  const M = 100;
  const cur = f.i >= 0 ? order[f.i] : null;
  return (
    <div className="widget card scl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول المحاضرات: الأبكر انتهاءً أولًا</span>
      </div>
      <div className="ap-sliders">
        <label><span>عدد المحاضرات <b>{n}</b></span><input type="range" min={6} max={20} value={n} onChange={(e) => setN(+e.target.value)} /></label>
        <button className="btn btn-sm" onClick={() => setSeed(seed + 1)}>محاضرات أخرى</button>
      </div>
      <div className="scl-box" dir="ltr">
        {f.last > -Infinity && <div className="scl-line" style={{ left: `${(f.last / M) * 100}%` }} title="نهاية آخر محاضرة مأخوذة" />}
        {order.map((c, k) => {
          const st = f.taken.includes(c.id) ? 'take' : f.rejected.includes(c.id) ? 'rej' : '';
          return (
            <div key={c.id} className="scl-row">
              <div className={`scl-bar ${st} ${cur && cur.id === c.id ? 'cur' : ''}`} style={{ left: `${(c.s / M) * 100}%`, width: `${((c.f - c.s) / M) * 100}%` }}>
                <small>{k + 1}</small>
              </div>
            </div>
          );
        })}
      </div>
      <div className="edl-msg">
        {!cur ? 'المحاضرات مرتبة حسب وقت الانتهاء، من الأعلى. الخط الرأسي سيمثل نهاية آخر محاضرة أخذناها.'
          : f.taken.includes(cur.id) ? <>المحاضرة {f.i + 1} تبدأ بعد نهاية آخر محاضرة مأخوذة: <b>خذها</b>. ويتحرك الخط إلى نهايتها.</>
          : <>المحاضرة {f.i + 1} تبدأ قبل نهاية آخر محاضرة مأخوذة: تتعارض، فنتركها.</>}
      </div>
      <div className="da-stats">
        <span>اختارت الخوارزمية الجشعة: <b className="ltr">{f.taken.length}</b></span>
        <span>الأكثر ممكن (بالبرمجة الديناميكية): <b className="ltr">{opt}</b></span>
      </div>
      <div className="vm-help">بعد الترتيب، الخوارزمية حلقة واحدة لا ترجع أبدًا. جرّب محاضرات كثيرة: العدد في النهاية يساوي الأكثر الممكن دائمًا، والقسم يبرهن لماذا.</div>
      <Player s={s} />
    </div>
  );
}

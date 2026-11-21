import { useMemo, useState } from 'react';
import { PI_DIGITS, lisTake1, lisTake2, lisWitness, take1Frames, type LFrame1 } from '../lib/lis';
import { Player, useStepper } from '../engine/stepper';

/** Take 1 step by step (include or exclude, the black bar), and the cost of both strategies as n grows. */
export default function LISLab() {
  const [n, setN] = useState(8);
  const A = PI_DIGITS.slice(0, n);
  const frames = useMemo(() => take1Frames(A), [n]);
  const s = useStepper<LFrame1>(frames, 8);
  const f = s.frame;
  const wit = new Set(lisWitness(A));
  const rows = useMemo(() => [6, 10, 14, 18, 20].map((m) => {
    const B = PI_DIGITS.slice(0, m);
    return { m, t1: lisTake1(B).calls, t2: lisTake2(B).calls, len: lisTake2(B).len };
  }), []);
  const D: Record<LFrame1['decision'], string> = {
    take: 'نجرب أن نأخذه، ونترك للاستدعاء البقية',
    skip: 'ثم نجرب أن نتركه',
    forced: 'لا يمكن أخذه: ليس أكبر من آخر عنصر أخذناه. نتخطاه',
    end: 'نهاية المصفوفة: متتالية متزايدة كاملة',
  };
  return (
    <div className="widget card lsl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أطول متتالية متزايدة: خذ أو اترك</span>
      </div>
      <div className="ap-sliders">
        <label><span>أول <b>{n}</b> أرقام من π</span><input type="range" min={3} max={12} value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      <div className="lsl-arr" dir="ltr">
        {A.map((x, i) => {
          const taken = f.taken.includes(i);
          const past = i < f.j;
          const cur = i === f.j && f.decision !== 'end';
          return (
            <span key={i} className={`${taken ? 'take' : past ? 'skip' : ''} ${cur ? 'cur' : ''}`}>
              {x}{cur && <i>?</i>}
            </span>
          );
        }).flatMap((el, i) => (i === f.j ? [<b key="bar" className="lsl-bar" />, el] : [el]))}
        {f.j === A.length && <b className="lsl-bar" />}
      </div>
      <div className="lsl-msg">
        {D[f.decision]}. آخر عنصر مأخوذ: <b className="ltr">{f.prev === -Infinity ? '−∞' : f.prev}</b>. وهذا كل ما نحتاج إلى تذكره من الماضي.
      </div>
      <div className="da-stats">
        <span>أطول ما وجدناه حتى الآن: <b className="ltr">{f.best}</b></span>
        <span>الجواب: <b className="ltr">{wit.size}</b>، مثلًا <bdi dir="ltr">{[...wit].map((i) => A[i]).join(' < ')}</bdi></span>
      </div>
      <table className="lsl-tab">
        <thead><tr><th>n</th><th>Take 1: LISbigger</th><th>Take 2: LISfirst</th><th>LIS</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.m}><td className="ltr">{r.m}</td><td className="ltr">{r.t1.toLocaleString('en')}</td><td className="ltr">{r.t2.toLocaleString('en')}</td><td className="ltr">{r.len}</td></tr>)}</tbody>
      </table>
      <div className="vm-help">الجدول يعدّ الاستدعاءات لكل طريقة على أول n رقمًا من π. الطريقتان أسيتان في أسوأ الحالات، لكن العدد يعتمد على المدخل: الطريقة الثانية لا تزور إلا المتتاليات المتزايدة نفسها. وكلتاهما تعيد حل المسائل الجزئية نفسها مرارًا.</div>
      <Player s={s} />
    </div>
  );
}

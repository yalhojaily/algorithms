import { useState } from 'react';
import { bottles, christmas, christmasVerses } from '../lib/songs';

/** Singing time as an algorithm's running time: count what is sung, and watch what doubling n does. */
export default function SongLab() {
  const [n, setN] = useState(4);
  const b = bottles(n), c = christmas(n), b2 = bottles(2 * n), c2 = christmas(2 * n);
  const verses = christmasVerses(Math.min(n, 12));
  const rows: { ar: string; f: (k: number) => number; theta: string }[] = [
    { ar: 'BottlesOfBeer: مرات «beer»', f: (k) => bottles(k).beer, theta: 'Θ(n)' },
    { ar: 'NDaysOfChristmas: الأسطر المغناة', f: (k) => christmas(k).lines, theta: 'Θ(n²)' },
    { ar: 'NDaysOfChristmas: ذكر هدية', f: (k) => christmas(k).mentions, theta: 'Θ(n²)' },
    { ar: 'NDaysOfChristmas: الهدايا المستلمة', f: (k) => christmas(k).gifts, theta: 'Θ(n³)' },
  ];
  return (
    <div className="widget card sg">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">كم يستغرق الغناء؟</span>
      </div>
      <div className="ap-sliders">
        <label><span>n = <b>{n}</b></span><input type="range" min={1} max={40} value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      <table className="sg-tab">
        <thead><tr><th>ما نعدّه</th><th className="ltr">n = {n}</th><th className="ltr">n = {2 * n}</th><th>النسبة عند المضاعفة</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => {
            const a = r.f(n), d = r.f(2 * n);
            return (
              <tr key={r.ar}>
                <td>{r.ar}</td>
                <td className="ltr">{a.toLocaleString('en')}</td>
                <td className="ltr">{d.toLocaleString('en')}</td>
                <td className="ltr"><b>× {(d / a).toFixed(2)}</b></td>
                <td className="ltr">{r.theta}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="da-stats">
        <span>الصيغ:</span>
        <span className="sg-f"><bdi dir="ltr">3n + 3 = {b.beer}</bdi></span>
        <span className="sg-f"><bdi dir="ltr">n(n+1)/2 = {c.mentions}</bdi></span>
        <span className="sg-f"><bdi dir="ltr">n(n+1)(n+2)/6 = {c.gifts}</bdi></span>
      </div>
      <details className="sg-lyr">
        <summary>نص NDaysOfChristmas({Math.min(n, 12)}) كما ينتجه الكود</summary>
        <div dir="ltr">
          {verses.map((v, i) => <p key={i}>{v.map((l, k) => <span key={k} className={k === 0 ? 'h' : ''}>{l}</span>)}</p>)}
        </div>
      </details>
      <div className="vm-help">مع n كبير، النسبة عند المضاعفة تقترب من 2 للخطي، و4 للتربيعي، و8 للتكعيبي. هذه النسبة لا تعتمد على سرعة المغني ولا على التقنية: هذا ما يقيسه الرمز Θ. وقارن <bdi dir="ltr">n = {n}</bdi> بـ <bdi dir="ltr">{2 * n}</bdi>: <bdi dir="ltr">{b.beer} → {b2.beer}</bdi> و<bdi dir="ltr">{c.gifts} → {c2.gifts}</bdi>.</div>
    </div>
  );
}

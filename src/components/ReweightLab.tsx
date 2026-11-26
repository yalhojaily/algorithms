import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { JOHNSON_G, REWEIGHT_G, johnsonPrices } from '../lib/apsp';
import type { G } from '../lib/bookgraphs';

const allPaths = (g: G, s: number, t: number, wt: (k: number) => number) => {
  const out: { path: number[]; len: number }[] = [];
  const rec = (v: number, path: number[], len: number) => {
    if (v === t) { out.push({ path: [...path], len }); return; }
    g.edges.forEach(([a, b], k) => { if (a === v && !path.includes(b)) { path.push(b); rec(b, path, len + wt(k)); path.pop(); } });
  };
  rec(s, [s], 0);
  return out.sort((a, b) => a.len - b.len);
};

/** Figure 9.1: adding c to every edge changes which path is shortest. */
export function ShiftLab() {
  const [c, setC] = useState(0);
  const g = REWEIGHT_G, nm = g.names;
  const wt = (k: number) => (g.edges[k][2] ?? 1) + c;
  const paths = allPaths(g, 0, 4, wt), best = paths[0];
  const shown: G = { ...g, edges: g.edges.map(([u, v, w]) => [u, v, (w ?? 1) + c]) };
  return (
    <div className="widget card rw">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">أضف ثابتًا إلى كل حافة؟</span></div>
      <div className="ap-sliders"><label>أضف إلى كل وزن: <b className="ltr">+{c}</b><input type="range" min={0} max={4} value={c} onChange={(e) => setC(Number(e.target.value))} /></label></div>
      <GraphSvg g={shown} st={{ directed: true, scale: 64, r: 14, weights: true,
        eClass: (u, v) => (best.path.some((x, i) => i > 0 && best.path[i - 1] === u && x === v) ? 'tree' : '') }} />
      <div className="da-stats">{paths.map((p, i) => <span key={i}><bdi dir="ltr">{p.path.map((x) => nm[x]).join('→')}</bdi>: <b className="ltr">{p.len}</b> ({p.path.length - 1} حواف)</span>)}</div>
      <div className="edl-msg">كل حافة تزيد {c}، فالمسار ذو k حواف يزيد <bdi dir="ltr">{c}k</bdi>. فالمسارات الطويلة بعدد الحواف تطول أسرع، و{c >= 1 ? <b>تغير أقصر مسار</b> : 'لم يتغير شيء بعد'}.</div>
    </div>
  );
}

/** Johnson's reweighting: w'(u→v) = π(u) + w(u→v) − π(v). Every u→v path shifts by π(u) − π(v). */
export function PriceLab() {
  const g = JOHNSON_G, nm = g.names, n = nm.length;
  const [pi, setPi] = useState<number[]>(Array(n).fill(0));
  const J = useMemo(() => johnsonPrices(g)!, [g]);
  const w2 = (k: number) => pi[g.edges[k][0]] + (g.edges[k][2] ?? 1) - pi[g.edges[k][1]];
  const shown: G = { ...g, edges: g.edges.map(([u, v], k) => [u, v, w2(k)]) };
  const neg = g.edges.filter((_, k) => w2(k) < 0).length;
  const orig = allPaths(g, 0, 4, (k) => g.edges[k][2] ?? 1), now = allPaths(g, 0, 4, w2);
  const key = (p: number[]) => p.join();
  return (
    <div className="widget card rw">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">أسعار الرؤوس: ضريبة خروج وهدية دخول</span></div>
      <div className="rw-prices" dir="ltr">
        {nm.map((c, v) => (
          <span key={v}>π({c}) = <b>{pi[v]}</b>
            <button onClick={() => setPi(pi.map((x, i) => (i === v ? x - 1 : x)))}>−</button>
            <button onClick={() => setPi(pi.map((x, i) => (i === v ? x + 1 : x)))}>+</button>
          </span>
        ))}
      </div>
      <div className="rel-tabs">
        <button className="pr-tab" onClick={() => setPi(Array(n).fill(0))}>كل الأسعار صفر</button>
        <button className="pr-tab" onClick={() => setPi(J)}>أسعار Johnson: <bdi dir="ltr">π(v) = dist(s, v)</bdi></button>
      </div>
      <GraphSvg g={shown} st={{ directed: true, scale: 70, r: 15, weights: true, label: (v) => `π=${pi[v]}`,
        eClass: (u, v) => { const k = g.edges.findIndex(([a, b]) => a === u && b === v); return w2(k) < 0 ? 'back' : ''; } }} />
      <div className="da-stats">
        <span>حواف سالبة الآن: <b className="ltr">{neg}</b></span>
        {orig.map((p, i) => {
          const q = now.find((x) => key(x.path) === key(p.path))!;
          return <span key={i}><bdi dir="ltr">{p.path.map((x) => nm[x]).join('→')}</bdi>: <bdi dir="ltr">{p.len} → {q.len}</bdi></span>;
        })}
      </div>
      <div className="edl-msg">كل مسار من a إلى e تغير طوله بالمقدار نفسه بالضبط: <bdi dir="ltr">π(a) − π(e) = {pi[0] - pi[4]}</bdi>. فترتيب المسارات لم يتغير، وأقصرها ما زال الأقصر. {neg === 0 ? <b>ولا حواف سالبة: Dijkstra تعمل الآن.</b> : 'جرّب أسعار Johnson لتختفي الحواف السالبة.'}</div>
    </div>
  );
}

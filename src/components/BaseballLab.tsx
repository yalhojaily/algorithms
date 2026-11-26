import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { AL_EAST, eliminated } from '../lib/flowapps';
import type { G } from '../lib/bookgraphs';

/** Baseball elimination: pick a team, change its current wins, and watch the flow network decide. */
export default function BaseballLab() {
  const L0 = AL_EAST, tm = L0.teams;
  const [x, setX] = useState(4);
  const [w, setW] = useState(L0.W[4]);
  const L = useMemo(() => ({ ...L0, W: L0.W.map((v, i) => (i === x ? w : v)) }), [x, w]);
  const r = useMemo(() => eliminated(L, x), [L, x]);
  const pick = (i: number) => { setX(i); setW(L0.W[i]); };
  const nG = r.pairs.length, nT = r.others.length, h = Math.max(nG, nT) - 1;
  const g: G = {
    names: ['s', ...r.pairs.map(() => ''), ...r.others.map((i) => tm[i]), 't'],
    xy: [[0, h / 2], ...r.pairs.map((_, k) => [1.7, (h - (nG - 1)) / 2 + k] as [number, number]),
      ...r.others.map((_, k) => [3.4, (h - (nT - 1)) / 2 + k * (nG > 1 ? (nG - 1) / Math.max(1, nT - 1) : 1)] as [number, number]), [4.9, h / 2]],
    edges: r.E.map(([u, v]) => [u, v]),
  };
  const R = new Set(r.R), out = r.out, trivial = r.trivial.length > 0;
  const gR = r.R.reduce((a, i) => a + L.W[i], 0) + r.pairs.filter(([i, j]) => R.has(i) && R.has(j)).reduce((a, [i, j]) => a + L.G[i][j], 0);
  return (
    <div className="widget card bb">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">هل خرج الفريق رياضيًا؟</span></div>
      <div className="bb-pick">{tm.map((t, i) => <button key={t} className={`pr-tab ${i === x ? 'on' : ''}`} onClick={() => pick(i)}><bdi dir="ltr">{t}</bdi></button>)}</div>
      <div className="xm-ctl">
        <label htmlFor="bb-w">انتصارات <bdi dir="ltr">{tm[x]}</bdi> الآن: <b className="ltr">{w}</b></label>
        <input id="bb-w" type="range" min={L0.W[x] - 15} max={L0.W[x] + 15} value={w} onChange={(e) => setW(+e.target.value)} />
        <button className="pr-tab" onClick={() => setW(L0.W[x])}>القيمة الحقيقية</button>
      </div>
      <div className="xm-wrap"><table className="bb-t"><tbody>
        <tr><th>الفريق</th><th>W</th><th>المتبقي</th>{tm.map((t) => <th key={t}><bdi dir="ltr">{t}</bdi></th>)}</tr>
        {tm.map((t, i) => <tr key={t} className={i === x ? 'me' : R.has(i) && out && !trivial ? 'rr' : ''}>
          <td><bdi dir="ltr">{t}</bdi></td><td>{L.W[i]}</td><td>{L.left[i]}</td>{tm.map((_, j) => <td key={j}>{i === j ? '' : L.G[i][j]}</td>)}</tr>)}
      </tbody></table></div>
      <div className="xm-wrap">
        <GraphSvg g={g} st={{ directed: true, scale: 64, r: 17,
          label: (v) => (v >= 1 && v <= nG ? `${tm[r.pairs[v - 1][0]]}–${tm[r.pairs[v - 1][1]]}` : null),
          vClass: (v) => (out && !trivial ? (r.S[v] ? 'c1' : 'c3') : ''),
          eLabel: (u, v) => { const k = r.E.findIndex(([a, b]) => a === u && b === v); return r.E[k][2] === Infinity ? null : `${r.f[k]}/${r.E[k][2]}`; },
          eClass: (u, v) => { const k = r.E.findIndex(([a, b]) => a === u && b === v); return r.E[k][2] !== Infinity && r.f[k] === r.E[k][2] ? 'tree' : r.f[k] > 0 ? 'cross' : ''; } }} />
      </div>
      <div className={`pj-verdict ${out ? 'bad' : 'ok'}`}>
        {trivial ? <>خرج بلا حاجة إلى تدفق: أقصى ما يبلغه <bdi dir="ltr">{tm[x]}</bdi> هو {r.best}، و<bdi dir="ltr">{r.trivial.map((i) => tm[i]).join(', ')}</bdi> عنده أكثر من ذلك الآن.</>
          : out ? <>خرج رياضيًا. المباريات المتبقية بين الآخرين {r.games}، وأكبر تدفق {r.flow} فقط، فلا يُشبَع كل ما يخرج من s. والشاهد من القطع الأصغر: الفرق <bdi dir="ltr">{r.R.map((i) => tm[i]).join(', ')}</bdi> لها الآن ومن مبارياتها بينها {gR} انتصارًا على الأقل، أي بمعدل {(gR / r.R.length).toFixed(2)} للفريق، وهذا أكثر من {r.best}.</>
          : <>لم يخرج. أكبر تدفق {r.flow} يساوي المباريات المتبقية بين الآخرين ({r.games}): التدفق يعين فائزًا لكل مباراة، ولا يتجاوز أي فريق {r.best} انتصارًا، وهو أقصى ما يبلغه <bdi dir="ltr">{tm[x]}</bdi> إن فاز بكل مبارياته الـ{L.left[x]}.</>}
      </div>
    </div>
  );
}

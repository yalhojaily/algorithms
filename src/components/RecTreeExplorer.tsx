import { useState } from 'react';
import { RECURRENCES, levels } from '../lib/recur';
import { Tex } from './MathText';

const MAXBOX = 16;
const fmt = (v: number) => (Number.isInteger(v) ? v.toLocaleString('en') : v.toFixed(1));

/** The recursion tree drawn level by level: how many nodes, what size, how much work, and the sum. */
export default function RecTreeExplorer() {
  const [key, setKey] = useState('ms');
  const R = RECURRENCES.find((r) => r.key === key)!;
  const [idx, setIdx] = useState(4);
  const k = Math.min(idx, R.sizes.length - 1);
  const n = R.sizes[k];
  const L = levels(R, n);
  const sum = L.reduce((s, l) => s + l.total, 0);
  const maxLevel = Math.max(...L.map((l) => l.total));
  const shown = L.length > 13 ? [...L.slice(0, 6), null, ...L.slice(-4)] : L;

  const first = L[0].total, last = L[L.length - 1].total;
  const shape = L.length < 3 ? '' : Math.abs(first - last) <= 0.01 * Math.max(first, last) || (L.slice(0, -1).every((l) => Math.abs(l.total - first) < 1e-9))
    ? 'equal' : first > last ? (R.kind === 'sub' ? 'slow' : 'down') : 'up';

  return (
    <div className="widget card rx">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">شجرة الاستدعاء مستوى مستوى</span>
      </div>
      <div className="rx-pick">
        {RECURRENCES.map((r) => (
          <button key={r.key} className={`tt-preset ${r.key === key ? 'on' : ''}`} onClick={() => { setKey(r.key); }}>
            <Tex>{r.tex}</Tex>
          </button>
        ))}
      </div>
      <div className="ct-size">
        <label>
          <span className="qg-label">n = <b className="ltr">{n.toLocaleString('en')}</b></span>
          <input type="range" min={0} max={R.sizes.length - 1} value={k} onChange={(e) => setIdx(+e.target.value)} />
        </label>
        <span className="ct-note">مصدرها: {R.origin}. كل عقدة حجمها m تكلف <Tex>{R.fTex.replace(/n/g, 'm')}</Tex>، والأوراق حجمها 1.</span>
      </div>

      <div className="rx-levels" dir="ltr">
        <div className="rx-row rx-head"><span>level</span><span>nodes × size</span><span /><span>level work</span></div>
        {shown.map((l, i) => l === null ? (
          <div key={`gap${i}`} className="rx-row rx-gap"><span>⋮</span><span>{L.length - 10} more levels</span><span /><span>⋮</span></div>
        ) : (
          <div key={l.depth} className="rx-row">
            <span className="rx-d">{l.depth}</span>
            <span className="rx-boxes">
              {Array.from({ length: Math.min(l.nodes, MAXBOX) }, (_, j) => <i key={j} title={`size ${l.size}`}>{l.nodes <= 8 ? fmt(l.size) : ''}</i>)}
              {l.nodes > MAXBOX && <em>… ×{l.nodes.toLocaleString('en')}</em>}
              {l.nodes <= MAXBOX && l.nodes > 8 && <em>×{l.nodes} · size {fmt(l.size)}</em>}
            </span>
            <span className="rx-bar"><b style={{ width: `${(l.total / maxLevel) * 100}%` }} /></span>
            <span className="rx-t">{l.nodes.toLocaleString('en')}·{fmt(l.perNode)} = <b>{fmt(l.total)}</b></span>
          </div>
        ))}
        <div className="rx-row rx-sum"><span /><span>{L.length} levels</span><span /><span>T({n.toLocaleString('en')}) = <b>{fmt(sum)}</b></span></div>
      </div>

      <div className="rx-check">
        <div>الصيغة المغلقة: <Tex>{`T(n) = ${R.exactTex}`}</Tex> ← عند <span className="ltr">n = {n.toLocaleString('en')}</span>: <b className="ltr">{fmt(R.exact(n))}</b> {Math.abs(R.exact(n) - sum) < 1e-6 ? <span className="ct-ok">✓</span> : <span className="ct-ok bad">✗</span>}</div>
        <div>الرتبة: <Tex>{R.theta}</Tex></div>
        {shape && (
          <div className="vm-help">
            {shape === 'equal' && 'كل المستويات تعمل القدر نفسه: المجموع = عمل مستوى واحد × عدد المستويات.'}
            {shape === 'down' && 'عمل المستويات يتناقص نزولًا: الجذر يسيطر، والمجموع من رتبة عمل الجذر.'}
            {shape === 'slow' && 'عمل المستويات يتناقص ببطء (حسابيًا لا هندسيًا): لا يسيطر مستوى واحد، فاجمع المستويات كلها. هنا n + (n−1) + ⋯ + 1.'}
            {shape === 'up' && 'عمل المستويات يتزايد نزولًا: الأوراق تسيطر، والمجموع من رتبة عدد الأوراق.'}
          </div>
        )}
      </div>
    </div>
  );
}

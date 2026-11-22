import { useMemo, useState } from 'react';
import { SALLOWS, countLetters, huffmanFrames, type HFrame, type HNode } from '../lib/greedy';
import { Player, useStepper } from '../engine/stepper';

const PRESETS: { ar: string; freq?: Record<string, number>; text?: string }[] = [
  { ar: 'جملة Sallows (الكتاب)', freq: SALLOWS },
  { ar: 'نص عربي', text: 'العلم في الصغر كالنقش على الحجر والعلم في الكبر كالكتابة على الماء' },
  { ar: 'ABRACADABRA', text: 'ABRACADABRA' },
];

/** BuildHuffman: repeatedly merge the two lightest trees; then read the codes off the final tree. */
export default function HuffmanLab() {
  const [p, setP] = useState(0);
  const [custom, setCustom] = useState('');
  const freq = useMemo(() => {
    if (custom.trim()) return countLetters(custom);
    const q = PRESETS[p];
    return q.freq ?? countLetters(q.text!);
  }, [p, custom]);
  const h = useMemo(() => huffmanFrames(freq), [freq]);
  const s = useStepper<HFrame>(h.frames, 2);
  const f = s.frame;
  const done = h.frames.indexOf(f) === h.frames.length - 1;
  // layout the current forest: trees side by side, leaves spaced evenly
  const lay = new Map<number, { x: number; d: number }>();
  let leaf = 0, maxD = 0;
  const place = (v: number, d: number): number => {
    const nd = h.nodes[v];
    maxD = Math.max(maxD, d);
    if (nd.left < 0) { lay.set(v, { x: leaf++, d }); return leaf - 1; }
    const a = place(nd.left, d + 1), b = place(nd.right, d + 1);
    const x = (a + b) / 2;
    lay.set(v, { x, d });
    return x;
  };
  const forest = [...f.forest].sort((a, b) => h.nodes[a].w - h.nodes[b].w || a - b);
  for (const r of forest) { place(r, 0); leaf += 0.6; }
  const W = Math.max(320, leaf * 30), H = (maxD + 1) * 44 + 24;
  const X = (x: number) => 14 + (x + 0.5) * ((W - 28) / Math.max(1, leaf));
  const Y = (d: number) => 18 + d * 44;
  const edges: [number, number][] = [];
  for (const v of lay.keys()) { const nd = h.nodes[v]; if (nd.left >= 0) edges.push([v, nd.left], [v, nd.right]); }
  const N = Object.values(freq).reduce((a, b) => a + b, 0), k = Object.keys(freq).length;
  const fixed = Math.max(1, Math.ceil(Math.log2(k))) * N;
  const leaves = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return (
    <div className="widget card hfl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">شفرة Huffman: ادمج الأخفّين</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((q, i) => <button key={i} className={`tt-preset ${i === p && !custom ? 'on' : ''}`} onClick={() => { setCustom(''); setP(i); }}>{q.ar}</button>)}
      </div>
      <input className="hfl-in" placeholder="أو اكتب نصك هنا…" value={custom} onChange={(e) => setCustom(e.target.value)} />
      <div className="sst-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 620), display: 'block', width: '100%' }} direction="ltr">
          {edges.map(([a, b]) => (
            <g key={`${a}-${b}`}>
              <line x1={X(lay.get(a)!.x)} y1={Y(lay.get(a)!.d) + 10} x2={X(lay.get(b)!.x)} y2={Y(lay.get(b)!.d) - 10} className="fbt-e" />
              {done && <text x={(X(lay.get(a)!.x) + X(lay.get(b)!.x)) / 2 + (h.nodes[a].left === b ? -6 : 6)} y={(Y(lay.get(a)!.d) + Y(lay.get(b)!.d)) / 2} className="hfl-bit" textAnchor="middle">{h.nodes[a].left === b ? 0 : 1}</text>}
            </g>
          ))}
          {[...lay.entries()].map(([v, { x, d }]) => {
            const nd: HNode = h.nodes[v];
            const isLeaf = nd.left < 0;
            const hot = f.merged && (f.merged[0] === v || f.merged[1] === v);
            return (
              <g key={v} className={`hfl-n ${isLeaf ? 'leaf' : 'in'} ${v === f.made ? 'made' : ''} ${hot ? 'hot' : ''}`}>
                {isLeaf ? <rect x={X(x) - 11} y={Y(d) - 11} width={22} height={22} rx={5} /> : <circle cx={X(x)} cy={Y(d)} r={11} />}
                <text x={X(x)} y={Y(d) + (isLeaf ? 1 : 4)} textAnchor="middle">{isLeaf ? nd.label : nd.w}</text>
                {isLeaf && <text x={X(x)} y={Y(d) + 21} textAnchor="middle" className="hfl-w">{nd.w}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="edl-msg">
        {f.merged ? <>دمجنا أخفّ شجرتين (<b className="ltr">{h.nodes[f.merged[0]].w}</b> و<b className="ltr">{h.nodes[f.merged[1]].w}</b>) في عقدة وزنها <b className="ltr">{h.nodes[f.made].w}</b>. بقي <b className="ltr">{f.forest.length}</b> {f.forest.length === 1 ? 'شجرة: انتهى' : 'شجرة'}.</>
          : <>كل حرف شجرة من عقدة واحدة، وزنها تكراره. الأشجار مرتبة من الأخف.</>}
      </div>
      {done && (
        <div className="hfl-tab-wrap">
          <table className="hfl-tab">
            <thead><tr><th>الحرف</th><th>التكرار</th><th>الشفرة</th><th>البتات</th></tr></thead>
            <tbody>{leaves.map(([ch, w]) => <tr key={ch}><td><bdi>{ch}</bdi></td><td className="ltr">{w}</td><td className="ltr hfl-code">{h.codes[ch]}</td><td className="ltr">{w * h.codes[ch].length}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      <div className="da-stats">
        <span>طول الرسالة بشفرة Huffman: <b className="ltr">{h.bits}</b> بت</span>
        <span>بطول ثابت (<bdi dir="ltr">⌈log₂ {k}⌉ = {Math.max(1, Math.ceil(Math.log2(k)))}</bdi> بت للحرف): <b className="ltr">{fixed}</b> بت</span>
      </div>
      <Player s={s} />
    </div>
  );
}

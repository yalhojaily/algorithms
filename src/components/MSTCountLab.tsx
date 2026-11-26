import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import type { G } from '../lib/bookgraphs';
import { shorterEdge, spanningTrees } from '../lib/mst';

const NAMES = 'abcde'.split('');
const XY: [number, number][] = [[1, 0], [2, 0.8], [1.6, 2], [0.4, 2], [0, 0.8]];
const E: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 4]];
const PRESETS: Record<string, number[]> = { ones: [1, 1, 1, 1, 1, 1, 1], ties: [1, 2, 1, 2, 1, 3, 3], distinct: [4, 1, 6, 2, 7, 3, 5] };

/** How many minimum spanning trees? Click an edge button to change its weight. */
export default function MSTCountLab() {
  const [w, setW] = useState<number[]>(PRESETS.ties);
  const [tie, setTie] = useState(false);
  const g: G = useMemo(() => ({ names: NAMES, xy: XY, edges: E.map(([u, v], k) => [u, v, w[k]] as [number, number, number]) }), [w]);
  const all = useMemo(() => spanningTrees(g), [g]);
  const cost = (T: number[]) => T.reduce((s, k) => s + w[k], 0);
  const best = Math.min(...all.map(cost));
  const mins = all.filter((T) => cost(T) === best);
  // Kruskal with ShorterEdge: the tie-broken MST
  const pick = useMemo(() => {
    const order = E.map((_, k) => k).sort(shorterEdge(g)), p = [0, 1, 2, 3, 4];
    const f = (x: number): number => (p[x] === x ? x : (p[x] = f(p[x])));
    const T: number[] = [];
    for (const k of order) { const [u, v] = E[k]; if (f(u) !== f(v)) { p[f(u)] = f(v); T.push(k); } }
    return T.sort((a, b) => a - b).join();
  }, [g]);
  const distinct = new Set(w).size === w.length;
  return (
    <div className="widget card mc">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">كم شجرة تغطية صغرى؟</span>
      </div>
      <div className="rel-tabs">
        <button className="pr-tab" onClick={() => setW(PRESETS.ones)}>كل الأوزان 1</button>
        <button className="pr-tab" onClick={() => setW(PRESETS.ties)}>أوزان متكررة</button>
        <button className="pr-tab" onClick={() => setW(PRESETS.distinct)}>أوزان مختلفة</button>
      </div>
      <div className="vm-help">انقر زر حافة ليتغير وزنها (1 ← 2 ← … ← 7 ← 1).</div>
      <div className="mc-edges" dir="ltr">
        {E.map(([u, v], k) => (
          <button key={k} onClick={() => setW(w.map((x, i) => (i === k ? (x % 7) + 1 : x)))}>{NAMES[u]}{NAMES[v]}: {w[k]}</button>
        ))}
      </div>
      <GraphSvg g={g} st={{ scale: 70, r: 14, weights: true, eClass: (u, v) => (mins.length === 1 && mins[0].some((k) => E[k][0] === u && E[k][1] === v) ? 'tree' : '') }} />
      <div className="da-stats">
        <span>أشجار التغطية: <b className="ltr">{all.length}</b></span>
        <span>أصغر وزن: <b className="ltr">{best}</b></span>
        <span>أشجار بهذا الوزن: <b className="ltr">{mins.length}</b></span>
        <span>الأوزان مختلفة؟ <b>{distinct ? 'نعم' : 'لا'}</b></span>
      </div>
      <label className="wf-all" style={{ marginBottom: 8 }}><input type="checkbox" checked={tie} onChange={(e) => setTie(e.target.checked)} /> كسر التعادل بـ ShorterEdge (الأخضر هو المختار)</label>
      <div className="mc-trees">
        {mins.slice(0, 12).map((T, i) => {
          const set = new Set(T);
          return (
            <div key={i} className={`mc-tree ${tie && T.slice().sort((a, b) => a - b).join() === pick ? 'pick' : ''}`}>
              <GraphSvg g={g} st={{ scale: 34, r: 7, eClass: (u, v) => (E.some(([a, b], k) => a === u && b === v && set.has(k)) ? 'tree' : 'dim') }} />
            </div>
          );
        })}
      </div>
      <div className="edl-msg">
        {mins.length === 1 ? (distinct ? <>الأوزان مختلفة كلها، فالشجرة الصغرى <b>وحيدة</b> (المأخذ 7.1).</> : <>الشجرة وحيدة رغم تكرار الأوزان: عكس المأخذ 7.1 خاطئ (الحاشية 1).</>)
          : <>{mins.length} أشجار بالوزن الأصغر نفسه. {tie ? 'ShorterEdge يرتب الحواف ترتيبًا كليًا، فيختار واحدة بعينها دائمًا.' : 'فعّل كسر التعادل لترى أي واحدة تختار الخوارزميات.'}</>}
      </div>
    </div>
  );
}

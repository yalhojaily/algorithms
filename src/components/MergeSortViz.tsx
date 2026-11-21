import { useMemo, useState } from 'react';
import { MS_PSEUDO, insertionComparisonsOf, makeInput, mergeSortFrames, mergeWorst, splitTree, type MsFrame } from '../lib/mergesort';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

type Kind = 'random' | 'sorted' | 'reversed' | 'few';
const KINDS: { k: Kind; label: string }[] = [
  { k: 'random', label: 'عشوائية' },
  { k: 'sorted', label: 'مرتبة' },
  { k: 'reversed', label: 'معكوسة' },
  { k: 'few', label: 'قيم مكررة' },
];

/** Merge sort step by step: the split tree, the array with both runs and the merge buffer, and a comparison counter. */
export default function MergeSortViz() {
  const [kind, setKind] = useState<Kind>('random');
  const [n, setN] = useState(8);
  const [seed, setSeed] = useState(3);
  const input = useMemo(() => makeInput(kind, n, seed), [kind, n, seed]);
  const frames = useMemo(() => record(mergeSortFrames(input)), [input]);
  const s = useStepper<MsFrame>(frames, 3);
  const fr = s.frame;
  const tree = useMemo(() => splitTree(n), [n]);
  const depth = Math.max(...tree.map((t) => t.depth));
  const maxV = Math.max(...input, 1);
  const ins = useMemo(() => insertionComparisonsOf(input), [input]);

  const phaseText = {
    split: <>قسّم <b className="ltr">A[{fr.lo}..{fr.hi}]</b> عند <b className="ltr">mid = {fr.mid}</b>، ورتّب كل نصف ذاتيًا.</>,
    base: <>الجزء <b className="ltr">A[{fr.lo}..{fr.hi}]</b> عنصر واحد: مرتب أصلًا (حالة الأساس).</>,
    merge: <>ادمج النصفين المرتبين <b className="ltr">A[{fr.lo}..{fr.mid}]</b> و<b className="ltr">A[{fr.mid + 1}..{fr.hi}]</b>: قارن أول عنصرين متبقيين، وخذ الأصغر.</>,
    merged: <>الجزء <b className="ltr">A[{fr.lo}..{fr.hi}]</b> أصبح مرتبًا.</>,
    done: <>انتهى: المصفوفة مرتبة بـ <b className="ltr">{fr.comparisons}</b> مقارنة.</>,
  }[fr.phase];

  return (
    <div className="widget card msv">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الترتيب بالدمج خطوة خطوة</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {KINDS.map((x) => <button key={x.k} className={`tt-preset ${x.k === kind ? 'on' : ''}`} onClick={() => setKind(x.k)}>{x.label}</button>)}
        <span className="qg-label">n =</span>
        {[8, 12, 16].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        {kind !== 'sorted' && kind !== 'reversed' && <button className="tt-preset" onClick={() => setSeed(seed + 1)}>🎲</button>}
      </div>

      <div className="msv-tree" dir="ltr" aria-label="شجرة التقسيم">
        {Array.from({ length: depth + 1 }, (_, d) => (
          <div key={d} className="msv-level" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {tree.filter((t) => t.depth === d).map((t) => {
              const key = `${t.lo}-${t.hi}`;
              const active = fr.lo === t.lo && fr.hi === t.hi && fr.phase !== 'done';
              return <span key={key} style={{ gridColumn: `${t.lo + 1} / ${t.hi + 2}` }} className={`${fr.sorted.has(key) ? 'ok' : ''} ${active ? 'on' : ''}`}>{t.hi - t.lo + 1}</span>;
            })}
          </div>
        ))}
      </div>

      <div className="msv-bars" dir="ltr" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {fr.arr.map((v, k) => {
          const inSeg = k >= fr.lo && k <= fr.hi && fr.phase !== 'done';
          const left = fr.phase === 'merge' && k >= fr.lo && k <= fr.mid;
          const right = fr.phase === 'merge' && k > fr.mid && k <= fr.hi;
          const used = fr.phase === 'merge' && ((left && k < (fr.i ?? 0)) || (right && k < (fr.j ?? 0)));
          const ptr = fr.phase === 'merge' && (k === fr.i && fr.i! <= fr.mid || k === fr.j && fr.j! <= fr.hi);
          return (
            <div key={k} className={`msv-col ${inSeg ? 'seg' : ''} ${left ? 'L' : ''} ${right ? 'R' : ''} ${used ? 'used' : ''} ${ptr ? 'ptr' : ''}`}>
              <i style={{ height: `${(v / maxV) * 100}%` }} />
              <span>{v}</span>
            </div>
          );
        })}
      </div>
      {fr.phase === 'merge' && (
        <div className="msv-out" dir="ltr">
          <span className="msv-out-l">out</span>
          {Array.from({ length: fr.hi - fr.lo + 1 }, (_, k) => (
            <b key={k} className={k < (fr.out?.length ?? 0) ? (k === (fr.out!.length - 1) && fr.took ? `new ${fr.took}` : 'full') : ''}>{fr.out?.[k] ?? ''}</b>
          ))}
        </div>
      )}

      <div className="tt-side">
        <Pseudocode lines={MS_PSEUDO} active={fr.line || null} />
        <div className="tt-info">
          <div className="inv-banner on">{phaseText}</div>
          <div className="msv-stats">
            <div><span>مقارنات الدمج حتى الآن</span><b className="ltr">{fr.comparisons}</b></div>
            <div><span>الحد الأعلى للدمج <span className="ltr">n⌈log₂ n⌉ − 2^⌈log₂ n⌉ + 1</span></span><b className="ltr">{mergeWorst(n)}</b></div>
            <div><span>الإدراج على المدخل نفسه</span><b className="ltr">{ins}</b></div>
          </div>
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

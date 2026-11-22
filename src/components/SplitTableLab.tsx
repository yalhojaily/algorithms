import { useMemo, useState } from 'react';
import { splitTableFrames, type STFrame } from '../lib/dp';
import { WORDS, isPalindrome, segmentFrames } from '../lib/segment';
import { Player, useStepper } from '../engine/stepper';

const PRESETS = [
  { s: 'bothearthandsaturnspin', pal: false },
  { s: 'artistoil', pal: false },
  { s: 'bothearthx', pal: false },
  { s: 'aaaaaaaaaaaa', pal: true },
];

/** FastSplittable: the table SplitTable[1..n+1], filled right to left. */
export default function SplitTableLab() {
  const [p, setP] = useState(0);
  const { s: A, pal } = PRESETS[p];
  const isWord = pal ? isPalindrome : (w: string) => WORDS.includes(w);
  const frames = useMemo(() => splitTableFrames(A, isWord), [p]);
  const back = useMemo(() => segmentFrames(A, isWord, true, 1).calls, [p]);
  const st = useStepper<STFrame>(frames, 10);
  const f = st.frame;
  const n = A.length;
  return (
    <div className="widget card spt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول SplitTable: من اليمين إلى اليسار</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((q, i) => <button key={i} className={`tt-preset ${i === p ? 'on' : ''}`} onClick={() => setP(i)}><span className="ltr">{q.s.toUpperCase()}</span>{q.pal ? ' (متناظرات)' : ''}</button>)}
      </div>
      <div className="spt-grid" dir="ltr">
        {Array.from({ length: n + 1 }, (_, k) => k + 1).map((i) => {
          const v = f.table[i];
          const word = f.j >= 0 && i >= f.i && i <= f.j;
          return (
            <div key={i} className={`spt-c ${i === f.i ? 'cur' : ''} ${f.j >= 0 && i === f.j + 1 ? 'dep' : ''} ${word ? 'word' : ''}`}>
              <span className="spt-ch">{i <= n ? A[i - 1].toUpperCase() : '∅'}</span>
              <span className={`spt-v ${v === true ? 't' : v === false ? 'f' : ''}`}>{v === null ? '·' : v ? 'T' : 'F'}</span>
              <small>{i}</small>
            </div>
          );
        })}
      </div>
      <div className="spt-msg">
        {f.j < 0 ? (f.i === n + 1 ? <>الأساس: <bdi dir="ltr">SplitTable[{n + 1}] = True</bdi> (السلسلة الفارغة).</> : 'امتلأ الجدول. الجواب في الخانة الأولى.')
          : <><bdi dir="ltr">IsWord({A.slice(f.i - 1, f.j).toUpperCase()}) ∧ SplitTable[{f.j + 1}]</bdi> = <b>{f.hit ? 'True' : 'False'}</b>{f.hit ? '، فـ SplitTable[' + f.i + '] = True' : ''}</>}
      </div>
      <div className="da-stats">
        <span>استدعاءات IsWord: <b className="ltr">{f.isWordCalls}</b> من <bdi dir="ltr">n(n+1)/2 = {(n * (n + 1)) / 2}</bdi></span>
        <span>التراجع (كل التقطيعات) استدعاها <b className="ltr">{back.toLocaleString('en')}</b> مرة</span>
        {f.i === 0 && <span>الجواب: <b>{f.table[1] ? 'True' : 'False'}</b></span>}
      </div>
      <div className="vm-help">الخانة <bdi dir="ltr">SplitTable[i]</bdi> تعتمد فقط على الخانات التي على يمينها، فنملأ من اليمين. الخانة المحاطة بالأصفر هي التي نحسبها، والمظللة الحروف المرشحة كلمة، والمحاطة بالأخضر الخانة التي نقرؤها.</div>
      <Player s={st} />
    </div>
  );
}

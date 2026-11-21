import { useMemo, useState } from 'react';
import { WORDS, isPalindrome, segmentFrames, type SegFrame } from '../lib/segment';
import { Player, useStepper } from '../engine/stepper';

const PRESETS = [
  { s: 'bothearthandsaturnspin', mode: 'words' as const },
  { s: 'artistoil', mode: 'words' as const },
  { s: 'hearthandsaturnspin', mode: 'words' as const },
  { s: 'aaaaaaaaaa', mode: 'pal' as const },
  { s: 'rotatoracecar', mode: 'pal' as const },
];

/** Splittable(i): the black bar between decided words and the suffix still to split. */
export default function SegmentLab() {
  const [p, setP] = useState(0);
  const [all, setAll] = useState(true);
  const { s: A, mode } = PRESETS[p];
  const isWord = mode === 'pal' ? isPalindrome : (w: string) => WORDS.includes(w);
  const run = useMemo(() => segmentFrames(A, isWord, all), [A, mode, all]);
  const st = useStepper<SegFrame>(run.frames, 6);
  const f = st.frame;
  const end = f.i < 0;
  const maxV = Math.max(1, ...run.visits);
  return (
    <div className="widget card sgl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">تقطيع النص: الخط الفاصل والاستدعاء</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((q, i) => <button key={i} className={`tt-preset ${i === p ? 'on' : ''}`} onClick={() => setP(i)}><span className="ltr">{q.s.toUpperCase()}</span>{q.mode === 'pal' ? ' (متناظرات)' : ''}</button>)}
      </div>
      <label className="qn-chk"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> لا تتوقف عند أول نجاح: عُدّ كل التقطيعات</label>
      <div className="sgl-line" dir="ltr">
        {end ? <span className="sgl-done">{run.result ? `${run.solutions.length} segmentation${run.solutions.length === 1 ? '' : 's'}` : 'not splittable'}</span> : (
          <>
            {f.path.map((w, k) => <span key={k} className="sgl-w">{w.toUpperCase()}</span>)}
            <span className="sgl-bar" />
            {f.trying ? (
              <>
                <span className={`sgl-cand ${f.ok ? 'ok' : 'no'}`}>{A.slice(f.trying[0], f.trying[1] + 1).toUpperCase()}</span>
                <span className="sgl-rest">{A.slice(f.trying[1] + 1).toUpperCase()}</span>
              </>
            ) : <span className="sgl-rest">{A.slice(f.i).toUpperCase()}</span>}
          </>
        )}
      </div>
      <div className="sgl-msg">
        {end ? (run.result ? 'انتهى البحث.' : 'لا يمكن التقطيع إلى كلمات.')
          : f.found ? <>وصلنا إلى نهاية السلسلة: تقطيع كامل.</>
          : f.trying ? <><bdi dir="ltr">IsWord({A.slice(f.trying[0], f.trying[1] + 1).toUpperCase()})</bdi> = <b>{f.ok ? 'True' : 'False'}</b>{f.ok ? '. نقبلها مؤقتًا ونستدعي على الباقي.' : '. نجرب كلمة أطول.'}</>
          : null}
      </div>
      <div className="sgl-visits">
        <div className="sgl-vh">كم مرة استُدعيت <bdi dir="ltr">Splittable(i)</bdi> لكل لاحقة <bdi dir="ltr">A[i..n]</bdi> حتى الآن:</div>
        <div className="sgl-bars" dir="ltr">
          {f.visits.map((v, i) => (
            <div key={i} className="sgl-col" title={`i = ${i + 1}`}>
              <div className="sgl-b" style={{ height: `${(v / maxV) * 60}px` }}>{v > 0 && <small>{v}</small>}</div>
              <span>{i < A.length ? A[i].toUpperCase() : '∅'}</span>
            </div>
          ))}
        </div>
      </div>
      {run.solutions.length > 0 && (
        <details className="sgl-sols">
          <summary>التقطيعات التي وُجدت ({run.solutions.length})</summary>
          <div dir="ltr">{run.solutions.slice(0, 60).map((x, k) => <div key={k}>{x.map((w) => w.toUpperCase()).join('·')}</div>)}</div>
        </details>
      )}
      <div className="da-stats">
        <span>استدعاءات IsWord: <b className="ltr">{f.isWordCalls}</b></span>
        <span>طول السلسلة <bdi dir="ltr">n = {A.length}</bdi> · التقطيعات الممكنة نظريًا <bdi dir="ltr">2<sup>n−1</sup> = {(2 ** (A.length - 1)).toLocaleString('en')}</bdi></span>
      </div>
      <div className="vm-help">لاحظ الأعمدة: اللاحقة نفسها تُحل مرات كثيرة، لأن طرقًا مختلفة من القرارات السابقة توصل إليها، والجواب في كل مرة هو نفسه. جرّب سلسلة الحروف <span className="ltr">A</span> مع المتناظرات: كل تقطيع ممكن صحيح، فيستكشف البحث <bdi dir="ltr">2<sup>n−1</sup></bdi> تقطيعًا. هذا الهدر هو ما سيعالجه الفصل 3.</div>
      <Player s={st} />
    </div>
  );
}

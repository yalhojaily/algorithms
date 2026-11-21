import { useMemo, useState } from 'react';
import { attacks, queensFrames, type QFrame } from '../lib/queens';
import { Player, useStepper } from '../engine/stepper';

const EV: Record<QFrame['ev'], string> = {
  try: 'مهاجَم: نتجاهل هذا المربع',
  place: 'آمن: نضع ملكة مؤقتًا، ونستدعي للصف التالي',
  solution: 'كل الصفوف ممتلئة: حل كامل! نطبعه ونتراجع',
  dead: 'لا مربع آمن في هذا الصف: طريق مسدود، نتراجع',
  done: 'انتهى البحث في الشجرة كلها',
};

/** PlaceQueens, one decision at a time: the board, the square being tried, and who attacks it. */
export default function QueensLab() {
  const [n, setN] = useState(4);
  const [verbose, setVerbose] = useState(true);
  const frames = useMemo(() => queensFrames(n, verbose && n <= 6), [n, verbose]);
  const s = useStepper<QFrame>(frames, n <= 4 ? 2 : 8);
  const f = s.frame;
  const showLast = f.ev === 'done' && f.last;
  const Q = showLast ? f.last! : f.Q;
  const cell = (r: number, c: number) => {
    const q = Q[r - 1] === c;
    const cand = f.ev === 'try' && f.r === r && f.j === c;
    const by = f.ev === 'try' && f.attackedBy === r && Q[r - 1] === c;
    let att = false;
    if (!showLast && f.ev !== 'done' && r === f.r && !q) for (let i = 1; i < f.r && i <= Q.length; i++) if (attacks(Q, i, r, c)) { att = true; break; }
    return { q, cand, by, att };
  };
  return (
    <div className="widget card qn">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الملكات: صفًا صفًا، مع التراجع</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">n =</span>
        {[4, 5, 6, 8].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        <label className="qn-chk"><input type="checkbox" checked={verbose} disabled={n > 6} onChange={(e) => setVerbose(e.target.checked)} /> أظهر المربعات المهاجَمة أيضًا{n > 6 ? ' (حتى n = 6)' : ''}</label>
      </div>
      <div className="qn-body">
        <div className="qn-board" dir="ltr" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)`, maxWidth: n * 46 }}>
          {Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
            const { q, cand, by, att } = cell(r + 1, c + 1);
            const cur = !showLast && f.r === r + 1 && f.ev !== 'done';
            return (
              <div key={`${r}-${c}`} className={`qn-sq ${(r + c) % 2 ? 'dk' : ''} ${cur ? 'row' : ''} ${att ? 'att' : ''} ${cand ? 'cand' : ''} ${by ? 'by' : ''} ${q && f.ev === 'place' && f.r === r + 1 ? 'new' : ''}`}>
                {q ? '♛' : cand ? '✕' : ''}
              </div>
            );
          }))}
        </div>
        <div className="qn-side">
          <div className={`qn-ev ${f.ev}`}>{EV[f.ev]}</div>
          <div className="qn-q" dir="ltr">Q = [{Q.map((x) => x).join(', ')}{Q.length < n && !showLast ? (Q.length ? ', ' : '') + '…' : ''}]</div>
          {f.ev !== 'done' && <div className="qn-r">الصف الحالي <bdi dir="ltr">r = {Math.min(f.r, n)}</bdi>{f.ev === 'try' && <>، والمربع <bdi dir="ltr">j = {f.j}</bdi> تهاجمه ملكة الصف <b className="ltr">{f.attackedBy}</b></>}</div>}
          <div className="qn-stack" dir="ltr">
            {Array.from({ length: Math.min(f.ev === 'solution' ? n + 1 : f.r, n + 1) }, (_, k) => k + 1).filter((r) => f.ev !== 'done' && r <= n + 1).map((r) => (
              <div key={r} style={{ paddingLeft: (r - 1) * 10 }} className={r === f.r ? 'cur' : ''}>PlaceQueens(Q, {r})</div>
            ))}
          </div>
        </div>
      </div>
      <div className="da-stats">
        <span>الحلول: <b className="ltr">{f.solutions}</b></span>
        <span>الاستدعاءات (عقد الشجرة): <b className="ltr">{f.nodes}</b></span>
        {f.ev === 'done' && <span>آخر حل: <bdi dir="ltr">[{(f.last ?? []).join(', ')}]</bdi></span>}
      </div>
      <div className="vm-help">كل استدعاء يعرف شيئًا واحدًا: مواضع الملكات في الصفوف السابقة. يجرب الأعمدة من اليسار إلى اليمين، ويتجاهل المهاجَم، ويترك للاستدعاء التالي بقية الصفوف. مع <bdi dir="ltr">n = 4</bdi> ستجد الحلين وسبع عشرة عقدة، كما في Figure 2.3.</div>
      <Player s={s} />
    </div>
  );
}

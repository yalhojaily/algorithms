import { useMemo, useState } from 'react';
import { editPath, editTable } from '../lib/dp';
import DPGrid from './DPGrid';
import { Player, useStepper } from '../engine/stepper';

const PRESETS: [string, string][] = [['ALGORITHM', 'ALTRUISTIC'], ['FOOD', 'MONEY'], ['KITTEN', 'SITTING'], ['كتاب', 'مكتبة']];

/** EditDistance in row-major order, then one optimal path back from the corner, and the alignment it encodes. */
export default function EditLab() {
  const [p, setP] = useState(0);
  const [A, B] = PRESETS[p];
  const m = A.length, n = B.length;
  const E = useMemo(() => editTable(A, B), [p]);
  const path = useMemo(() => editPath(A, B, E), [p]);
  const total = (m + 1) * (n + 1);
  const frames = useMemo(() => Array.from({ length: total + 1 }, (_, k) => k), [p]);
  const s = useStepper<number>(frames, 8);
  const k = s.frame;                       // cells 0..k−1 (row-major) are filled; k === total means done
  const done = k >= total;
  const ci = Math.floor(Math.min(k, total - 1) / (n + 1)), cj = Math.min(k, total - 1) % (n + 1);
  const onPath = new Set(path.cells.map(([i, j]) => `${i},${j}`));
  const filled = (i: number, j: number) => i * (n + 1) + j < k;
  const isDep = (i: number, j: number) => !done && ci > 0 && cj > 0 && ((i === ci - 1 && j === cj) || (i === ci && j === cj - 1) || (i === ci - 1 && j === cj - 1));
  const free = !done && ci > 0 && cj > 0 && A[ci - 1] === B[cj - 1];
  return (
    <div className="widget card edl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول المسافة التحريرية، ثم المسار، ثم المحاذاة</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map(([a, b], i) => <button key={i} className={`tt-preset ${i === p ? 'on' : ''}`} onClick={() => setP(i)}><bdi>{a}</bdi> ← <bdi>{b}</bdi></button>)}
      </div>
      <DPGrid
        rows={['', ...A.split('')]}
        cols={['', ...B.split('')]}
        corner=""
        cell={(i, j) => {
          const cls = [
            filled(i, j) || (done) ? 'on' : 'empty',
            !done && i === ci && j === cj ? 'cur' : '',
            isDep(i, j) ? 'dep' : '',
            done && onPath.has(`${i},${j}`) ? 'path' : '',
            i > 0 && j > 0 && A[i - 1] === B[j - 1] ? 'eq' : '',
          ].join(' ');
          return { text: filled(i, j) || done ? E[i][j] : '', cls };
        }}
      />
      <div className="edl-msg">
        {done ? <>المسافة <b className="ltr">{E[m][n]}</b>. المسار المظلل يعود من الزاوية: القطري استبدال (مجاني إن تساوى الحرفان)، والأفقي إدراج، والرأسي حذف.</>
          : ci === 0 || cj === 0 ? <>حالة أساس: <bdi dir="ltr">Edit({ci}, {cj}) = {ci + cj}</bdi>.</>
          : <><div className="edl-f" dir="ltr">Edit({ci}, {cj}) = min(Edit({ci}, {cj - 1}) + 1, Edit({ci - 1}, {cj}) + 1, Edit({ci - 1}, {cj - 1}) + {free ? 0 : 1})</div>{free ? <>الحرفان متساويان (<b><bdi>{A[ci - 1]}</bdi></b>)، فالاستبدال مجاني.</> : <>الحرفان مختلفان: <b><bdi>{A[ci - 1]}</bdi></b> و<b><bdi>{B[cj - 1]}</bdi></b>.</>}</>}
      </div>
      {done && (
        <div className="edl-al" dir={/[؀-ۿ]/.test(A) ? 'rtl' : 'ltr'}>
          <div>{path.top.map((c, i) => <span key={i} className={c !== path.bot[i] ? 'x' : ''}>{c === ' ' ? ' ' : c}</span>)}</div>
          <div>{path.bot.map((c, i) => <span key={i} className={c !== path.top[i] ? 'x' : ''}>{c === ' ' ? ' ' : c}</span>)}</div>
        </div>
      )}
      <div className="da-stats"><span>الخانات: <b className="ltr">{Math.min(k, total)}</b> من <bdi dir="ltr">(m+1)(n+1) = {total}</bdi></span></div>
      <Player s={s} />
    </div>
  );
}

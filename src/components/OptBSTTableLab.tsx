import { useMemo, useState } from 'react';
import { optBSTFrames, type BSTOrder, type OBFrame } from '../lib/dp';
import DPGrid from './DPGrid';
import { Player, useStepper } from '../engine/stepper';

const F = [5, 8, 2, 1, 9, 5, 3];
const ORDERS: [BSTOrder, string][] = [['diag', 'قطرًا قطرًا'], ['rows', 'صفًا صفًا من الأسفل'], ['cols', 'عمودًا عمودًا من اليسار']];

/** OptimalBST: three valid evaluation orders over the same table OptCost[i, k]. */
export default function OptBSTTableLab() {
  const [order, setOrder] = useState<BSTOrder>('diag');
  const n = F.length;
  const frames = useMemo(() => optBSTFrames(F, order), [order]);
  const s = useStepper<OBFrame>(frames, 4);
  const f = s.frame;
  const done = frames.indexOf(f) === frames.length - 1;
  const deps = (i: number, k: number) => f.i > 0 && !done && ((i === f.i && k < f.k && k >= f.i - 1) || (k === f.k && i > f.i && i <= f.k + 1));
  return (
    <div className="widget card obtt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول <bdi dir="ltr">OptCost[i, k]</bdi> بثلاثة ترتيبات</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {ORDERS.map(([o, l]) => <button key={o} className={`tt-preset ${o === order ? 'on' : ''}`} onClick={() => setOrder(o)}>{l}</button>)}
      </div>
      <div className="obtt-f" dir="ltr">f = [{F.join(', ')}]</div>
      <DPGrid
        rows={Array.from({ length: n + 1 }, (_, r) => `i=${r + 1}`)}
        cols={Array.from({ length: n + 1 }, (_, c) => `k=${c}`)}
        cell={(r, c) => {
          const i = r + 1, k = c, v = f.C[i][k], root = f.R[i][k];
          if (k < i - 1) return { text: '', cls: 'void' };
          const cur = i === f.i && k === f.k;
          return {
            text: v === null ? '' : <>{v}{root !== null && <small className="dpg-sub">r={root}</small>}</>,
            cls: `${v === null ? 'empty' : k === i - 1 ? 'base' : 'on'} ${cur ? 'cur' : ''} ${deps(i, k) ? 'dep' : ''} ${done && i === 1 && k === n ? 'path' : ''}`,
          };
        }}
      />
      <div className="edl-msg">
        {f.i === 0 ? 'الأساس: القطر OptCost[i, i − 1] = 0 (مجال فارغ).'
          : done ? <>الجواب <bdi dir="ltr">OptCost[1, {n}] = {f.C[1][n]}</bdi>، وجذره <bdi dir="ltr">r = {f.R[1][n]}</bdi>. والترتيبات الثلاثة تعطي القيم نفسها في كل خانة.</>
          : <><bdi dir="ltr">OptCost[{f.i}, {f.k}]</bdi> تقرأ الخانات المظللة: كل ما على يسارها في صفها، وكل ما تحتها في عمودها.</>}
      </div>
      <div className="da-stats">
        <span>الخانات: <bdi dir="ltr">≈ n²/2</bdi>، وكل خانة تجرب حتى n جذرًا: <bdi dir="ltr">O(n³)</bdi></span>
      </div>
      <Player s={s} />
    </div>
  );
}

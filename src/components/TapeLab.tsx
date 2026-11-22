import { useState } from 'react';
import { tapeCost } from '../lib/greedy';

const FILES = { L: [7, 2, 5, 9, 3, 6], F: [4, 1, 6, 2, 5, 3] };
const NAMES = ['a', 'b', 'c', 'd', 'e', 'f'];

/** Files on tape: reorder by hand, by L, by F, by L/F; every adjacent swap shows what it would change. */
export default function TapeLab() {
  const { L, F } = FILES;
  const [eq, setEq] = useState(false);              // all frequencies equal (Lemma 4.1)
  const f = eq ? L.map(() => 1) : F;
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const cost = tapeCost(order, L, f);
  const best = tapeCost([...order].sort((a, b) => L[a] / f[a] - L[b] / f[b]), L, f);
  const swap = (k: number) => { const o = [...order]; [o[k], o[k + 1]] = [o[k + 1], o[k]]; setOrder(o); };
  const sortBy = (key: (i: number) => number) => setOrder([...order].sort((a, b) => key(a) - key(b)));
  const total = L.reduce((a, b) => a + b, 0);
  return (
    <div className="widget card tpl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">ترتيب الملفات على الشريط</span>
      </div>
      <label className="qn-chk"><input type="checkbox" checked={eq} onChange={(e) => setEq(e.target.checked)} /> كل الترددات متساوية (المأخذ 4.1)</label>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <button className="tt-preset" onClick={() => sortBy((i) => L[i])}>رتّب حسب الطول L</button>
        {!eq && <button className="tt-preset" onClick={() => sortBy((i) => -f[i])}>رتّب حسب التردد F تنازليًا</button>}
        {!eq && <button className="tt-preset" onClick={() => sortBy((i) => L[i] / f[i])}>رتّب حسب <bdi dir="ltr">L/F</bdi></button>}
        <button className="tt-preset" onClick={() => setOrder([5, 3, 0, 2, 4, 1])}>ترتيب سيئ</button>
      </div>
      <div className="tpl-tape" dir="ltr">
        {order.map((k, pos) => (
          <div key={k} className="tpl-seg" style={{ flex: L[k] }}>
            <div className="tpl-file" style={{ opacity: 0.35 + 0.65 * (f[k] / Math.max(...f)) }}>
              <b>{NAMES[k]}</b>
              <small>L={L[k]}{!eq && <> F={f[k]}</>}</small>
            </div>
            {pos < order.length - 1 && (() => {
              const a = order[pos], b = order[pos + 1], d = L[b] * f[a] - L[a] * f[b];
              return <button className={`tpl-sw ${d < 0 ? 'good' : d > 0 ? 'bad' : ''}`} onClick={() => swap(pos)} title="بدّل الملفين">⇄<small>{d > 0 ? '+' : ''}{d}</small></button>;
            })()}
          </div>
        ))}
      </div>
      <div className="tpl-scale" dir="ltr"><span>بداية الشريط</span><span>الطول الكلي {total}</span></div>
      <div className="da-stats">
        <span>التكلفة الكلية: <b className="ltr">{cost}</b></span>
        <span>الأقل ممكن: <b className="ltr">{best}</b></span>
        {cost === best && <span className="tpl-ok">ترتيب أمثل</span>}
      </div>
      <div className="vm-help">كل وصول إلى ملف يمرّ على كل الملفات قبله، فالتكلفة الكلية مجموع (تردد كل ملف × موضع نهايته على الشريط). والرقم تحت كل زر ⇄ هو التغير في التكلفة لو بدّلت الملفين المتجاورين: الأخضر يحسّن. ما دام في الشريط زر أخضر، فالترتيب ليس أمثل. هذه حجة التبديل نفسها.</div>
    </div>
  );
}

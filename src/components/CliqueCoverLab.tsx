import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { SMALL_G, complement, isIndependent } from '../lib/nphard';

/** One set, three readings: independent in G, clique in Ḡ, and V \ S a vertex cover of G. */
export default function CliqueCoverLab() {
  const g = SMALL_G, gc = useMemo(() => complement(g), []), n = g.names.length;
  const [S, setS] = useState<Set<number>>(new Set([0, 3, 6]));
  const [view, setView] = useState<'g' | 'c'>('g');
  const toggle = (v: number) => { const T = new Set(S); if (T.has(v)) T.delete(v); else T.add(v); setS(T); };
  const indep = isIndependent(g, S);
  const uncovered = g.edges.filter(([u, v]) => S.has(u) && S.has(v));
  return (
    <div className="widget card cc">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">مستقلة، زمرة، غطاء: مجموعة واحدة</span></div>
      <div className="rel-tabs">
        <button className={`pr-tab ${view === 'g' ? 'on' : ''}`} onClick={() => setView('g')}>الرسم G</button>
        <button className={`pr-tab ${view === 'c' ? 'on' : ''}`} onClick={() => setView('c')}>المتمم <bdi dir="ltr">Ḡ</bdi></button>
      </div>
      <div className="vm-help">انقر الرؤوس. الأخضر S، والبنفسجي <bdi dir="ltr">V \ S</bdi>.</div>
      {view === 'g' ? (
        <GraphSvg g={g} st={{ scale: 70, r: 16, onClick: toggle, vClass: (v) => (S.has(v) ? 'c1' : 'c3'),
          eClass: (u, v) => (S.has(u) && S.has(v) ? 'hot' : '') }} />
      ) : (
        <GraphSvg g={gc} st={{ scale: 70, r: 16, onClick: toggle, vClass: (v) => (S.has(v) ? 'c1' : 'c3'),
          eClass: (u, v) => (S.has(u) && S.has(v) ? 'tree' : 'dim') }} />
      )}
      <div className="da-stats">
        <span>S مستقلة في G؟ <b>{indep ? 'نعم' : 'لا'}</b></span>
        <span>S زمرة في <bdi dir="ltr">Ḡ</bdi>؟ <b>{indep ? 'نعم' : 'لا'}</b></span>
        <span><bdi dir="ltr">V \ S</bdi> غطاء لـ G؟ <b>{indep ? 'نعم' : 'لا'}</b></span>
        <span><bdi dir="ltr">|S| = {S.size}، |V \ S| = {n - S.size}</bdi></span>
      </div>
      <div className="edl-msg">
        {indep ? <>الأسئلة الثلاثة جوابها واحد دائمًا. وأكبر مجموعة مستقلة هنا حجمها 3، فأكبر زمرة في <bdi dir="ltr">Ḡ</bdi> حجمها 3، وأصغر غطاء لـ G حجمه <bdi dir="ltr">7 − 3 = 4</bdi>.</>
          : <>الحواف الكهرمانية داخل S: تمنع الاستقلال، وهي نفسها الحواف التي لا يغطيها <bdi dir="ltr">V \ S</bdi> (عددها {uncovered.length})، والأزواج الناقصة من الزمرة في <bdi dir="ltr">Ḡ</bdi>.</>}
      </div>
    </div>
  );
}

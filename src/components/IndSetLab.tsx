import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { BOOK_3CNF, indSetGraph, litTrue, clauseTrue } from '../lib/nphard';

/** 3SAT → MaxIndSet (Figure 12.8): pick vertices, or build the set from an assignment, and translate back. */
export default function IndSetLab() {
  const f = BOOK_3CNF, g = useMemo(() => indSetGraph(f), []), k = f.clauses.length;
  const [S, setS] = useState<Set<number>>(new Set());
  const [a, setA] = useState<boolean[]>([true, false, true, false]);
  const toggle = (v: number) => { const T = new Set(S); if (T.has(v)) T.delete(v); else T.add(v); setS(T); };
  const bad = g.edges.filter(([u, v]) => S.has(u) && S.has(v));
  const indep = bad.length === 0;
  const fromA = () => {
    const T = new Set<number>();
    f.clauses.forEach((c, j) => { const i = c.findIndex((l) => litTrue(l, a)); if (i >= 0) T.add(3 * j + i); });
    setS(T);
  };
  // assignment read off an independent set
  const derived = f.vars.map((_, v) => { const hit = [...S].map((u) => g.lits[u]).find((l) => l.v === v); return hit ? !hit.neg : null; });
  const derivedFull = derived.map((d) => d ?? false);
  const tri = (u: number) => Math.floor(u / 3);
  const done = indep && S.size === k;
  return (
    <div className="widget card is">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">من 3SAT إلى أكبر مجموعة مستقلة</span></div>
      <div className="vm-help">رأس لكل حرف في الصيغة. أضلاع المثلث: الحروف في البند نفسه. والحواف الأخرى: حرف ونفيه. انقر الرؤوس لتبني مجموعة.</div>
      <div className="bb-pick">
        {f.vars.map((x, i) => <button key={x} className={`pr-tab ${a[i] ? 'on' : ''}`} onClick={() => setA(a.map((b, j) => (j === i ? !b : b)))}><bdi dir="ltr">{x} = {a[i] ? 'T' : 'F'}</bdi></button>)}
        <button className="pr-tab" onClick={fromA}>مجموعة من هذا الإسناد</button>
        <button className="pr-tab" onClick={() => setS(new Set())}>امسح</button>
      </div>
      <GraphSvg g={g} st={{ scale: 58, r: 15, onClick: toggle,
        vClass: (v) => (S.has(v) ? (bad.some(([p, q]) => p === v || q === v) ? 'c5' : 'c1') : ''),
        eClass: (u, v) => (S.has(u) && S.has(v) ? 'hot' : tri(u) === tri(v) ? '' : 'dim') }} />
      <div className="da-stats">
        <span><bdi dir="ltr">|S|</bdi> = <b className="ltr">{S.size}</b> من <bdi dir="ltr">k = {k}</bdi></span>
        <span>مستقلة؟ <b>{indep ? 'نعم' : 'لا'}</b></span>
        <span>الإسناد <bdi dir="ltr">{a.map((b, i) => `${f.vars[i]}=${b ? 'T' : 'F'}`).join(' ')}</bdi> يحقق Φ؟ <b>{f.clauses.every((c) => clauseTrue(c, a)) ? 'نعم' : 'لا'}</b></span>
      </div>
      <div className="edl-msg">
        {!indep ? <>الحواف الكهرمانية تصل رأسين في S: إما حرفان من البند نفسه، وإما حرف ونفيه.</>
          : done ? <>مجموعة مستقلة حجمها k: رأس من كل مثلث. اجعل حروفها True: <bdi dir="ltr">{derived.map((d, i) => `${f.vars[i]}=${d === null ? '?' : d ? 'T' : 'F'}`).join(' ')}</bdi> (و«?» أي قيمة). فكل بند فيه حرف صحيح، والصيغة {f.clauses.every((c) => clauseTrue(c, derivedFull)) ? 'محققة' : 'غير محققة'}.</>
          : <>مستقلة، لكن حجمها {S.size}. كل مثلث يعطي رأسًا واحدًا على الأكثر، فالحد الأعلى k = {k}.</>}
      </div>
    </div>
  );
}

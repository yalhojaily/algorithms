import { useState } from 'react';
import GraphSvg from './GraphSvg';
import { CLAUSE_GADGET, extendGadget, type Color } from '../lib/nphard';

const CLS = ['c1', 'c5', 'c2'], NAME = ['True', 'False', 'Other'];

/** The clause gadget of Figure 12.13: set the three literal colors; the gadget extends to a 3-coloring unless all are False. */
export default function GadgetColorLab() {
  const [lits, setLits] = useState<Color[]>([1, 1, 0]);
  const col = extendGadget(lits);
  const flip = (i: number) => setLits(lits.map((c, j) => (j === i ? (c === 0 ? 1 : 0) : c)) as Color[]);
  return (
    <div className="widget card gc">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">أداة البند في التلوين الثلاثي</span></div>
      <div className="vm-help">انقر a أو b أو c لتبدل لونه بين True (أخضر) وFalse (أحمر). والعقدة T لونها True دائمًا. والأزرق هو Other.</div>
      <GraphSvg g={CLAUSE_GADGET} st={{ scale: 64, r: 15, onClick: (v) => { if (v < 3) flip(v); },
        vClass: (v) => (v < 3 ? CLS[lits[v]] : v === 3 ? 'c1' : col ? CLS[col[v]] : 'c4'),
        eClass: (u, v) => (col ? '' : u >= 4 || v >= 4 ? 'hot' : '') }} />
      <div className={`pj-verdict ${col ? 'ok' : 'bad'}`}>
        {col ? <>تلوين صالح للعقد الخمس الداخلية. البند <bdi dir="ltr">({['a', 'b', 'c'].map((x, i) => `${x}=${NAME[lits[i]]}`).join(', ')})</bdi> فيه حرف True على الأقل، فالأداة تُلوَّن.</>
          : <>لا تلوين ممكنًا: الحروف الثلاثة False. المثلث الأول يجبر مخرجه على False (المدخلان متساويان)، ثم العقدتان الأخيرتان يجب أن تختلفا عن False وعن T وعن بعضهما: لونان لعقدتين ولون واحد متاح.</>}
      </div>
      <div className="bb-pick">
        <button className="pr-tab" onClick={() => setLits([1, 1, 1])}>كلها False</button>
        <button className="pr-tab" onClick={() => setLits([1, 0, 1])}>واحد True</button>
        <button className="pr-tab" onClick={() => setLits([0, 0, 0])}>كلها True</button>
      </div>
    </div>
  );
}

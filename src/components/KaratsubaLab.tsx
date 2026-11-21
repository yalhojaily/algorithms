import { useMemo, useState } from 'react';
import { karaFrames, type KFrame } from '../lib/karatsuba';
import { Player, record, useStepper } from '../engine/stepper';
import MixText from './MixText';

const PAIRS: [bigint, bigint][] = [[12n, 34n], [1234n, 5678n], [31415926n, 27182818n]];
const ROLE: Record<string, string> = { root: '', z2: 'z2 = x₁·y₁', z0: 'z0 = x₀·y₀', z1: '(x₁+x₀)(y₁+y₀)' };

/** Karatsuba's recursion tree: each call splits, makes three recursive products, and combines. */
export default function KaratsubaLab() {
  const [k, setK] = useState(1);
  const [x, y] = PAIRS[k];
  const frames = useMemo(() => record(karaFrames(x, y), 5000), [x, y]);
  const s = useStepper<KFrame>(frames, 3);
  const f = s.frame;
  const school = x.toString().length * y.toString().length;
  const total = frames[frames.length - 1].mults;
  return (
    <div className="widget card ka">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">Karatsuba: ثلاثة ضروب بدل أربعة</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">الضرب:</span>
        {PAIRS.map(([a, b], i) => <button key={i} className={`tt-preset ${i === k ? 'on' : ''}`} onClick={() => setK(i)}><bdi dir="ltr">{`${a} × ${b}`}</bdi></button>)}
      </div>
      <div className="ka-tree" dir="ltr">
        {f.calls.map((c) => (
          <div key={c.id} className={`ka-row ${c.id === f.cur ? 'cur' : ''} ${c.result !== null ? 'ok' : ''}`} style={{ paddingLeft: 8 + c.depth * 22 }}>
            {c.role !== 'root' && <span className="ka-role">{ROLE[c.role]}</span>}
            <span className="ka-op">{c.x.toString()} × {c.y.toString()}</span>
            <span className="ka-res">{c.result !== null ? `= ${c.result}` : c.m ? `split ${c.m}` : ''}</span>
          </div>
        ))}
      </div>
      <div className="da-stats">
        <span>ضروب الأرقام حتى الآن: <b className="ltr">{f.mults}</b> / <b className="ltr">{total}</b></span>
        <span>الطريقة المدرسية: <b className="ltr">{school}</b></span>
        <span>الاستدعاءات: <b className="ltr">{f.calls.length}</b></span>
      </div>
      <div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}><MixText text={f.note} /></div>
      <div className="vm-help">كل استدعاء يقسم العددين عند المنتصف، ثم يستدعي نفسه ثلاث مرات فقط: z2 للنصفين العاليين، وz0 للنصفين المنخفضين، وحاصل ضرب المجموعين. والحد الأوسط z1 يأتي بالطرح، لا بضرب رابع.</div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { optimalChain, peasantChain, pingalaChain, slowChain, type Chain } from '../lib/power';

const ROWS: { key: string; ar: string; f: (n: number) => Chain }[] = [
  { key: 'slow', ar: 'SlowPower: اضرب في a كل مرة', f: slowChain },
  { key: 'ping', ar: 'Piṅgala: ربّع، وأضف a إن كان n فرديًا', f: pingalaChain },
  { key: 'peas', ar: 'Peasant: ربّع a نفسها، واجمع المربعات حسب البتات', f: peasantChain },
  { key: 'opt', ar: 'الأمثل (بحث شامل)', f: optimalChain },
];

/** How many multiplications does a^n need? The chain of exponents each algorithm builds. */
export default function PowerLab() {
  const [n, setN] = useState(15);
  const chains = useMemo(() => ROWS.map((r) => ({ ...r, c: r.f(n) })), [n]);
  return (
    <div className="widget card pw">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">كم ضربًا يحتاج <bdi dir="ltr">a<sup>n</sup></bdi>؟</span>
      </div>
      <div className="ap-sliders">
        <label><span>n = <b className="ltr">{n}</b> · بالثنائي <b className="ltr">{n.toString(2)}</b></span><input type="range" min={2} max={100} value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {[15, 16, 31, 33, 64, 71, 100].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
      </div>
      <div className="pw-rows">
        {chains.map(({ key, ar, c }) => (
          <div key={key} className={`pw-row ${key}`}>
            <div className="pw-head"><span>{ar}</span><b className="ltr">{c.steps.length}</b></div>
            <div className="pw-chain" dir="ltr">
              {key === 'slow' && c.exps.length > 14
                ? <><span>a</span><span>a²</span><span>a³</span><i>…</i><span>a<sup>{n}</sup></span></>
                : c.exps.map((e, i) => <span key={i} className={e === n ? 'end' : ''}>a{e > 1 && <sup>{e}</sup>}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="da-stats">
        <span><bdi dir="ltr">⌊log₂ n⌋ = {Math.floor(Math.log2(n))}</bdi>: حد أدنى، لأن كل ضرب يضاعف أكبر أس على الأكثر</span>
        <span>بتات 1 في n: <b className="ltr">{n.toString(2).split('').filter((x) => x === '1').length}</b></span>
      </div>
      <div className="vm-help">Piṅgala وPeasant يقومان كلاهما بـ <bdi dir="ltr">⌊log₂ n⌋</bdi> تربيعًا، وبضرب إضافي لكل بت 1 تقريبًا. جرّب n = 15: كلاهما 6، والأمثل 5. وجرّب قوى 2: الجميع ما عدا SlowPower يحقق الحد الأدنى.</div>
    </div>
  );
}

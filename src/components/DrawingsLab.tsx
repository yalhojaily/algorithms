import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { BOOK_G, circleXY, crossings, rng, type G } from '../lib/bookgraphs';

type Mode = 'embed' | 'circle' | 'random';

/** The same graph (Figure 5.4) in different drawings: the edges stay, only the points move. */
export default function DrawingsLab() {
  const [mode, setMode] = useState<Mode>('embed');
  const [seed, setSeed] = useState(7);
  const g: G = useMemo(() => {
    if (mode === 'embed') return BOOK_G;
    if (mode === 'circle') return { ...BOOK_G, xy: circleXY(13, 2.6) };
    const r = rng(seed);
    return { ...BOOK_G, xy: BOOK_G.names.map(() => [r() * 6, r() * 2.6] as [number, number]) };
  }, [mode, seed]);
  const x = crossings(g);
  return (
    <div className="widget card gd">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">رسم واحد، رسومات كثيرة</span>
      </div>
      <div className="rel-tabs">
        {([['embed', 'تضمين (الشكل 5.4)'], ['circle', 'على دائرة'], ['random', 'مواضع عشوائية']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} className={`pr-tab ${mode === m ? 'on' : ''}`} onClick={() => { setMode(m); if (m === 'random') setSeed(seed + 1); }}>{l}</button>
        ))}
      </div>
      <GraphSvg g={g} st={{ scale: 60, r: 12 }} />
      <div className="da-stats">
        <span>الرؤوس <bdi dir="ltr">V = 13</bdi></span>
        <span>الحواف <bdi dir="ltr">E = 19</bdi></span>
        <span>أزواج حواف متقاطعة: <b className="ltr">{x}</b></span>
      </div>
      <div className="edl-msg">
        {x === 0 ? <>لا تتقاطع أي حافتان: هذا الرسم <b>تضمين</b> (embedding)، فالرسم مستوٍ (planar).</>
          : <>في هذا الرسم {x} تقاطعًا، لكنه <b>الرسم نفسه</b>: المجموعتان <bdi dir="ltr">V</bdi> و<bdi dir="ltr">E</bdi> لم تتغيرا. والرسم مستوٍ لأن له رسمًا واحدًا على الأقل بلا تقاطع.</>}
      </div>
      {mode === 'random' && <button className="btn btn-sm" onClick={() => setSeed(seed + 1)}>مواضع أخرى</button>}
    </div>
  );
}

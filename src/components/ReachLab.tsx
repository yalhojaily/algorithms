import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { DIR_G, outAdj } from '../lib/dfs';

type Show = 'reach' | 'back' | 'both';

/** reach(v), reach⁻¹(v), and their intersection: the strong component of v. */
export default function ReachLab() {
  const g = DIR_G;
  const [v, setV] = useState(1);
  const [show, setShow] = useState<Show>('both');
  const [fw, bw] = useMemo(() => {
    const go = (adj: number[][]) => { const s = new Set([v]), st = [v]; while (st.length) for (const w of adj[st.pop()!]) if (!s.has(w)) { s.add(w); st.push(w); } return s; };
    const r: number[][] = g.names.map(() => []); for (const [a, b] of g.edges) r[b].push(a);
    return [go(outAdj(g)), go(r)];
  }, [v, g]);
  const inC = (x: number) => fw.has(x) && bw.has(x);
  const cls = (x: number) => {
    if (show === 'reach') return fw.has(x) ? 'c2' : '';
    if (show === 'back') return bw.has(x) ? 'c3' : '';
    return inC(x) ? 'c1' : fw.has(x) ? 'c2' : bw.has(x) ? 'c3' : '';
  };
  const list = (s: Set<number>) => g.names.filter((_, x) => s.has(x)).join(', ');
  return (
    <div className="widget card rl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">مكون رأس واحد: تقاطع بحثين</span>
      </div>
      <div className="rel-tabs">
        {([['reach', 'ما يصل إليه v'], ['back', 'ما يصل إلى v'], ['both', 'التقاطع']] as [Show, string][]).map(([k, l]) => (
          <button key={k} className={`pr-tab ${show === k ? 'on' : ''}`} onClick={() => setShow(k)}>{l}</button>
        ))}
      </div>
      <div className="vm-help">انقر أي رأس ليكون v.</div>
      <GraphSvg g={g} st={{ directed: true, scale: 64, r: 14, onClick: setV,
        vClass: (x) => `${cls(x)} ${x === v ? 'sel' : ''}`,
        eClass: (a, b) => (show === 'both' ? (inC(a) && inC(b) ? 'tree' : '') : show === 'reach' ? (fw.has(a) ? 'tree' : '') : bw.has(b) ? 'tree' : ''),
      }} />
      <div className="da-stats" dir="rtl">
        <span>يصل إليها {g.names[v]}: <bdi dir="ltr">{'{'}{list(fw)}{'}'}</bdi></span>
        <span>تصل إلى {g.names[v]}: <bdi dir="ltr">{'{'}{list(bw)}{'}'}</bdi></span>
        <span>المكون القوي: <b><bdi dir="ltr">{'{'}{g.names.filter((_, x) => inC(x)).join(', ')}{'}'}</bdi></b></span>
      </div>
      <div className="edl-msg">الأخضر في الاتجاهين، فهو المكون القوي لـ {g.names[v]}. الأزرق يصل إليه {g.names[v]} ولا يرجع، والبنفسجي يصل إلى {g.names[v]} ولا يصل إليه {g.names[v]}.</div>
    </div>
  );
}

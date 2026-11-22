import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { BOOK_G } from '../lib/bookgraphs';

type Tab = 'list' | 'array' | 'matrix';

/** The book's 13-vertex graph in three data structures. Click a vertex, then a second one to test the edge. */
export default function GraphRepLab() {
  const g = BOOK_G, n = g.names.length;
  const [tab, setTab] = useState<Tab>('list');
  const [u, setU] = useState<number | null>(4);
  const [v, setV] = useState<number | null>(null);
  const adj = useMemo(() => {
    const a: number[][] = g.names.map(() => []);
    for (const [x, y] of g.edges) { a[x].push(y); a[y].push(x); }
    return a.map((l) => l.sort((p, q) => p - q));
  }, [g]);
  const first = useMemo(() => { const f = [0]; for (const l of adj) f.push(f.at(-1)! + l.length); return f; }, [adj]);
  const click = (x: number) => {
    if (u === null || v !== null) { setU(x); setV(null); }
    else if (x === u) setU(null);
    else setV(x);
  };
  const isEdge = u !== null && v !== null && adj[u].includes(v);
  const nm = (x: number) => g.names[x];
  // work to answer "is uv an edge?" and "list u's neighbours"
  const cells = (k: number) => `${k} ${k >= 3 && k <= 10 ? 'خانات' : 'خانة'}`;
  const cost = (() => {
    if (u === null) return null;
    const du = adj[u].length, dv = v === null ? 0 : adj[v].length;
    if (tab === 'list') return { test: v === null ? null : `${cells(Math.min(du, dv))} (نمسح القائمة الأقصر)`, list: cells(du) };
    if (tab === 'array') return { test: v === null ? null : `${Math.max(1, Math.ceil(Math.log2(du + 1)))} مقارنة (بحث ثنائي في مقطع مرتب)`, list: cells(du) };
    return { test: v === null ? null : 'خانة واحدة', list: `${cells(n)} (الصف كله)` };
  })();
  const space = tab === 'matrix' ? `V² = ${n * n}` : tab === 'list' ? `V + 2E = ${n} + ${2 * g.edges.length}` : `(V + 1) + 2E = ${n + 1} + ${2 * g.edges.length}`;
  return (
    <div className="widget card gr">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الرسم نفسه في ثلاث بنى بيانات</span>
      </div>
      <div className="rel-tabs">
        {([['list', 'قائمة الجوار'], ['array', 'مصفوفة الجوار المتصلة'], ['matrix', 'مصفوفة الجوار']] as [Tab, string][]).map(([t, l]) => (
          <button key={t} className={`pr-tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      <div className="vm-help">انقر رأسًا لترى جيرانه، ثم رأسًا ثانيًا لتسأل: هل بينهما حافة؟</div>
      <GraphSvg g={g} st={{ onClick: click, scale: 56, r: 13,
        vClass: (x) => (x === u || x === v ? 'sel' : u !== null && v === null && adj[u].includes(x) ? 'nb' : ''),
        eClass: (a, b) => (u !== null && v !== null && ((a === u && b === v) || (a === v && b === u)) ? 'hot' : u !== null && v === null && (a === u || b === u) ? 'hot' : '') }} />

      {tab === 'list' && (
        <div className="gr-list" dir="ltr">
          {adj.map((l, x) => (
            <div key={x} className={`gr-row ${x === u || x === v ? 'on' : ''}`}>
              <span className="gr-head">{nm(x)}</span>
              {l.map((y, k) => <span key={k} className={`gr-cell ${(x === u && y === v) || (x === v && y === u) ? 'hit' : ''}`}>{nm(y)}</span>)}
            </div>
          ))}
        </div>
      )}
      {tab === 'array' && (
        <div className="gr-arr" dir="ltr">
          <div className="gr-arow"><span className="gr-al">first</span>{first.map((f, x) => <span key={x} className={x === u || x === u! + 1 ? 'on' : ''}>{f}<small>{x < n ? nm(x) : 'end'}</small></span>)}</div>
          <div className="gr-arow"><span className="gr-al">edges</span>{adj.flat().map((y, k) => <span key={k} className={u !== null && k >= first[u] && k < first[u + 1] ? (y === v ? 'hit' : 'on') : ''}>{nm(y)}<small>{k}</small></span>)}</div>
        </div>
      )}
      {tab === 'matrix' && (
        <div className="gr-mat-wrap">
          <table className="gr-mat" dir="ltr">
            <thead><tr><th />{g.names.map((c, y) => <th key={y} className={y === v || (v === null && y === u) ? 'on' : ''}>{c}</th>)}</tr></thead>
            <tbody>{g.names.map((c, x) => (
              <tr key={x}><th className={x === u ? 'on' : ''}>{c}</th>
                {g.names.map((_, y) => <td key={y} className={`${adj[x].includes(y) ? 'one' : ''} ${x === u && y === v ? 'hit' : x === u ? 'row' : ''}`}>{adj[x].includes(y) ? 1 : 0}</td>)}
              </tr>))}</tbody>
          </table>
        </div>
      )}
      <div className="da-stats">
        <span>الذاكرة: <bdi dir="ltr">{space}</bdi></span>
        {cost && <span>سرد جيران <b className="ltr">{nm(u!)}</b>: {cost.list}</span>}
        {cost?.test && <span>هل <bdi dir="ltr">{nm(u!)}{nm(v!)}</bdi> حافة؟ {cost.test}: <b>{isEdge ? 'نعم' : 'لا'}</b></span>}
      </div>
    </div>
  );
}

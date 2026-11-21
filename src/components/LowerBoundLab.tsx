import { useMemo, useState } from 'react';
import { ALGS, adversary, decisionTree, factorial, lowerBound, perms, treeStats, type DNode } from '../lib/lowerbound';

const L = 'ABCDE';
type AlgKey = keyof typeof ALGS;
const ALG_LABEL: Record<AlgKey, string> = { ins: 'الإدراج', sel: 'الاختيار', merge: 'الدمج' };

interface Placed { id: string; x: number; y: number; node: DNode; kids: { id: string; yes: boolean }[] }

function layout(t: DNode): { nodes: Map<string, Placed>; leaves: number } {
  const nodes = new Map<string, Placed>();
  let leaf = 0;
  const walk = (d: DNode, id: string, depth: number): number => {
    if (d.leaf) {
      const x = leaf++;
      nodes.set(id, { id, x, y: depth, node: d, kids: [] });
      return x;
    }
    const kids: { id: string; yes: boolean }[] = [];
    const xs: number[] = [];
    if (d.yes) { kids.push({ id: id + 'y', yes: true }); xs.push(walk(d.yes, id + 'y', depth + 1)); }
    if (d.no) { kids.push({ id: id + 'n', yes: false }); xs.push(walk(d.no, id + 'n', depth + 1)); }
    const x = xs.reduce((a, b) => a + b, 0) / xs.length;
    nodes.set(id, { id, x, y: depth, node: d, kids });
    return x;
  };
  walk(t, 'r', 0);
  return { nodes, leaves: leaf };
}

function DecisionTree() {
  const [alg, setAlg] = useState<AlgKey>('ins');
  const [n, setN] = useState(3);
  const [pick, setPick] = useState<string | null>(null);
  const tree = useMemo(() => decisionTree(ALGS[alg], n), [alg, n]);
  const st = useMemo(() => treeStats(tree), [tree]);
  const { nodes, leaves } = useMemo(() => layout(tree), [tree]);
  const W = n === 3 ? 64 : 40, H = n === 3 ? 70 : 54, pad = 26;
  const width = leaves * W + pad * 2 - (W - 30);
  const height = (st.height + 1) * H + 20;
  const X = (x: number) => pad + x * W;
  const Y = (y: number) => 22 + y * H;
  const onPath = (id: string) => pick !== null && pick.startsWith(id);

  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">الخوارزمية:</span>
        {(Object.keys(ALGS) as AlgKey[]).map((k) => <button key={k} className={`tt-preset ${k === alg ? 'on' : ''}`} onClick={() => { setAlg(k); setPick(null); }}>{ALG_LABEL[k]}</button>)}
        <span className="qg-label">n =</span>
        {[3, 4].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => { setN(v); setPick(null); }}>{v}</button>)}
      </div>
      <div className="da-stats">
        <span>الأوراق: <b className="ltr">{st.leaves}</b> = <bdi dir="ltr">{n}!</bdi></span>
        <span>الارتفاع (أسوأ حالة): <b className="ltr">{st.height}</b></span>
        <span>الحد الأدنى: <bdi dir="ltr">⌈log₂ {n}!⌉ = {lowerBound(n)}</bdi></span>
        {st.redundant > 0 && <span>مقارنات معروفة الجواب: <b className="ltr">{st.redundant}</b></span>}
      </div>
      <div className="lb-scroll" dir="ltr">
        <svg className="lb-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {[...nodes.values()].flatMap((p) => p.kids.map((k) => {
            const c = nodes.get(k.id)!;
            const single = p.kids.length === 1;
            return (
              <g key={k.id}>
                <line x1={X(p.x)} y1={Y(p.y)} x2={X(c.x)} y2={Y(c.y)} className={`lb-edge ${onPath(k.id) ? 'on' : ''} ${single ? 'dash' : ''}`} />
                <text x={(X(p.x) + X(c.x)) / 2 + (k.yes ? -6 : 6)} y={(Y(p.y) + Y(c.y)) / 2} className="lb-elbl" textAnchor={k.yes ? 'end' : 'start'}>{k.yes ? '<' : '>'}</text>
              </g>
            );
          }))}
          {[...nodes.values()].map((p) => p.node.leaf ? (
            <g key={p.id} className={`lb-leaf ${pick === p.id ? 'on' : ''}`} onClick={() => setPick(pick === p.id ? null : p.id)} style={{ cursor: 'pointer' }}>
              <rect x={X(p.x) - (n === 3 ? 26 : 18)} y={Y(p.y) - 11} width={n === 3 ? 52 : 36} height={22} rx={5} />
              <text x={X(p.x)} y={Y(p.y) + 4} textAnchor="middle">{p.node.leaf.map((k) => L[k]).join(n === 3 ? '<' : '')}</text>
            </g>
          ) : (
            <g key={p.id} className={`lb-node ${onPath(p.id) ? 'on' : ''}`}>
              <circle cx={X(p.x)} cy={Y(p.y)} r={n === 3 ? 18 : 15} />
              <text x={X(p.x)} y={Y(p.y) + 4} textAnchor="middle">{L[p.node.i!]}:{L[p.node.j!]}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="vm-help">كل عقدة داخلية سؤال: العقدة <bdi dir="ltr" className="lb-ans">B:A</bdi> تسأل «هل B أصغر من A؟». الفرع المعلَّم &lt; جوابه نعم، والمعلَّم &gt; جوابه لا. كل ورقة ترتيب نهائي. اضغط ورقة لترى المقارنات التي توصل إليها. {st.redundant > 0 && 'الخط المتقطع: مقارنة جوابها معروف من المقارنات السابقة، فليس لها إلا فرع واحد ممكن.'}</div>
    </>
  );
}

function AdversaryGame() {
  const [n, setN] = useState(4);
  const all = useMemo(() => perms(n), [n]);
  const [hist, setHist] = useState<{ i: number; j: number; yes: boolean; before: number; after: number }[]>([]);
  const alive = useMemo(() => {
    let a = all;
    for (const h of hist) a = adversary(a, h.i, h.j).alive;
    return a;
  }, [all, hist]);
  const pairs: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
  const ask = (i: number, j: number) => {
    const r = adversary(alive, i, j);
    setHist([...hist, { i, j, yes: r.answer, before: alive.length, after: r.alive.length }]);
  };
  const solved = alive.length === 1;
  const lb = lowerBound(n);
  const order = solved ? alive[0].map((_, k) => k).sort((a, b) => alive[0][a] - alive[0][b]) : [];
  const known = (i: number, j: number) => alive.every((p) => p[i] < p[j]) || alive.every((p) => p[i] > p[j]);

  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">عدد العناصر:</span>
        {[3, 4, 5].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => { setN(v); setHist([]); }}>{v}</button>)}
        <button className="btn btn-sm" onClick={() => setHist([])}>من جديد</button>
      </div>
      <div className="vm-help">رتّب العناصر المخفية {L.slice(0, n).split('').join('، ')} بأقل عدد من الأسئلة. الخصم لا يختار ترتيبًا مسبقًا: يجيب كل مرة بالجواب الذي يُبقي أكثر الترتيبات ممكنة.</div>
      <div className="lb-pairs" dir="ltr">
        {pairs.map(([i, j]) => (
          <button key={`${i}${j}`} className="tt-preset" disabled={solved || known(i, j)} onClick={() => ask(i, j)}>{L[i]} : {L[j]}</button>
        ))}
      </div>
      <div className="lb-meter">
        <div className="lb-bar"><i style={{ width: `${(alive.length / factorial(n)) * 100}%` }} /></div>
        <div className="da-stats">
          <span>الترتيبات الممكنة: <b className="ltr">{alive.length}</b> من <bdi dir="ltr">{n}! = {factorial(n)}</bdi></span>
          <span>الأسئلة: <b className="ltr">{hist.length}</b></span>
          <span>الحد الأدنى: <bdi dir="ltr">⌈log₂ {factorial(n)}⌉ = {lb}</bdi></span>
        </div>
      </div>
      {hist.length > 0 && (
        <div className="lb-hist" dir="ltr">
          {hist.map((h, k) => (
            <span key={k} className="lb-chip"><b className="lb-ans">{L[h.i]} {h.yes ? '<' : '>'} {L[h.j]}</b><em>{h.before} → {h.after}</em></span>
          ))}
        </div>
      )}
      {solved && (
        <div className={`inv-banner ${hist.length <= lb ? 'sq-ok' : 'on'}`}>
          الترتيب: <bdi dir="ltr">{order.map((k) => L[k]).join(' < ')}</bdi>. عدد أسئلتك {hist.length}{hist.length === lb ? '، وهو الحد الأدنى بالضبط.' : `، والحد الأدنى ${lb}.`} لا توجد خوارزمية تهزم هذا الخصم بأقل من {lb}.
        </div>
      )}
      <div className="vm-help">الأزرار المعطلة: أسئلة جوابها معروف من الأجوبة السابقة. لاحظ أن كل سؤال يُبقي نصف الترتيبات على الأقل، فلا بد من ⌈log₂ n!⌉ سؤالًا على الأقل.</div>
    </>
  );
}

/** The comparison-sorting lower bound two ways: the decision tree of a real algorithm, and an adversary game. */
export default function LowerBoundLab() {
  const [tab, setTab] = useState<'tree' | 'adv'>('tree');
  return (
    <div className="widget card lb">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">لماذا لا يمكن أقل من log₂ n! مقارنة؟</span>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${tab === 'tree' ? 'on' : ''}`} onClick={() => setTab('tree')}>شجرة القرار</button>
        <button className={`pr-tab ${tab === 'adv' ? 'on' : ''}`} onClick={() => setTab('adv')}>العب ضد الخصم</button>
      </div>
      {tab === 'tree' ? <DecisionTree /> : <AdversaryGame />}
    </div>
  );
}

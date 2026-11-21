import { useMemo, useState } from 'react';
import { backtrackCalls, balancedTree, buildTree, catalan, costWithRoot, optTable, treeCost } from '../lib/optbst';
import TreeView from './TreeView';

const PRESETS: { ar: string; f: number[] }[] = [
  { ar: 'ترددات متفاوتة', f: [5, 8, 2, 1, 9, 5, 3] },
  { ar: 'مفتاح واحد شائع جدًا', f: [1, 1, 1, 1, 1, 1, 40] },
  { ar: 'ترددات متساوية', f: [4, 4, 4, 4, 4, 4, 4] },
  { ar: 'متزايدة', f: [1, 2, 4, 8, 16, 32, 64] },
];

/** Choose the root yourself; the Recursion Fairy builds optimal subtrees. Compare with the balanced tree. */
export default function OptBSTLab() {
  const [p, setP] = useState(0);
  const f = PRESETS[p].f, n = f.length;
  const t = useMemo(() => optTable(f), [p]);
  const best = t.get(0, n - 1);
  const [root, setRoot] = useState<number | null>(null);
  const r = root ?? best.root;
  const costs = f.map((_, k) => costWithRoot(f, t, 0, n - 1, k));
  const maxC = Math.max(...costs);
  const tree = buildTree(t, 0, n - 1, r);
  const bal = treeCost(balancedTree(0, n - 1), f);
  return (
    <div className="widget card obt">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">اختر الجذر، والجنية تكمل الباقي</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        {PRESETS.map((q, i) => <button key={i} className={`tt-preset ${i === p ? 'on' : ''}`} onClick={() => { setP(i); setRoot(null); }}>{q.ar}</button>)}
      </div>
      <div className="obt-keys" dir="ltr">
        {f.map((fr, k) => (
          <button key={k} className={`obt-k ${k === r ? 'on' : ''} ${k === best.root ? 'best' : ''}`} onClick={() => setRoot(k)}>
            <span className="obt-bar" style={{ height: `${(costs[k] / maxC) * 70}px` }}><small>{costs[k]}</small></span>
            <b>A{k + 1}</b>
            <i>f = {fr}</i>
          </button>
        ))}
      </div>
      <div className="obt-cap">ارتفاع كل عمود: التكلفة الكلية إن جعلنا هذا المفتاح جذرًا، والشجرتان الفرعيتان مثاليتان. اضغط لتختار.</div>
      <TreeView root={tree} hl={r + 1} maxW={460} />
      <div className="da-stats">
        <span>تكلفة هذه الشجرة: <b className="ltr">{costs[r]}</b></span>
        <span>الأمثل: <b className="ltr">{best.cost}</b> (الجذر A{best.root + 1})</span>
        <span>الشجرة المتوازنة تمامًا: <b className="ltr">{bal}</b></span>
      </div>
      <div className="da-stats">
        <span>استدعاءات الحل بالتراجع لـ <bdi dir="ltr">n = {n}</bdi>: <b className="ltr">{backtrackCalls(n).toLocaleString('en')}</b></span>
        <span>عدد أشجار البحث الثنائية الممكنة: <b className="ltr">{catalan(n).toLocaleString('en')}</b></span>
      </div>
      <div className="vm-help">التكلفة: لكل مفتاح، تردده مضروبًا في عمقه، ثم المجموع. والجذر عمقه 1. جرّب «مفتاح واحد شائع جدًا»: المفتاح الشائع يصعد إلى الجذر ولو على حساب التوازن. و«متزايدة»: الشجرة المثلى سلسلة عمقها n، أسوأ شجرة ممكنة بمقياس الارتفاع. و«ترددات متساوية»: هنا يربح التوازن.</div>
    </div>
  );
}

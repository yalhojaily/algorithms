import { useState } from 'react';
import { AVL_PSEUDO, avlFrames, avlInsert, bstInsert, height, size, type BFrame, type TNode } from '../lib/bst';
import { mulberry32 } from '../lib/montecarlo';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';
import TreeView from './TreeView';

const ROT_AR: Record<string, string> = { LL: 'يسار-يسار: دوران يميني واحد', RR: 'يمين-يمين: دوران يساري واحد', LR: 'يسار-يمين: دورانان', RL: 'يمين-يسار: دورانان' };
const empty: BFrame[] = [{ root: null, path: [], hl: null, line: 1, note: 'شجرة فارغة. أدرج مفاتيح وراقب أرقام التوازن فوق العقد', done: true }];

/** AVL insertion step by step: heights, balance factors and the four rotation cases, next to a plain BST fed the same keys. */
export default function AVLLab() {
  const [frames, setFrames] = useState<BFrame[]>(empty);
  const [seq, setSeq] = useState<number[]>([]);
  const [x, setX] = useState(10);
  const [seed, setSeed] = useState(3);
  const s = useStepper<BFrame>(frames, 2);
  const f = s.frame;
  const base = frames[frames.length - 1].root;
  const plain = seq.reduce<TNode | null>((t, k) => bstInsert(t, k), null);

  const ins = (k: number) => {
    if (seq.includes(k) || seq.length >= 31) return;
    setFrames(record(avlFrames(base, k)));
    setSeq([...seq, k]);
  };
  const bulk = (keys: number[], note: string) => {
    const root = keys.reduce<TNode | null>((t, k) => avlInsert(t, k), null);
    setFrames([{ root, path: [], hl: null, line: 8, note, done: true }]);
    setSeq(keys);
  };
  const next = seq.length ? Math.max(...seq) + 1 : 1;
  const rot = frames.find((fr) => fr.rot)?.rot;

  return (
    <div className="widget card avl">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">شجرة AVL: الدوران يحفظ التوازن</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <label className="hp-in"><span className="qg-label">x =</span><input type="number" min={1} max={99} value={x} onChange={(e) => setX(Math.max(1, Math.min(99, +e.target.value || 1)))} dir="ltr" /></label>
        <button className="btn btn-sm" disabled={seq.includes(x) || seq.length >= 31} onClick={() => ins(x)}>INSERT(x)</button>
        <button className="btn btn-sm" disabled={seq.length >= 31} onClick={() => ins(next)}>أدرج <bdi dir="ltr">{next}</bdi> (التالي بالترتيب)</button>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">ابدأ من جديد:</span>
        <button className="tt-preset" onClick={() => { setFrames(empty); setSeq([]); }}>شجرة فارغة</button>
        <button className="tt-preset" onClick={() => bulk(Array.from({ length: 15 }, (_, i) => i + 1), 'أدرجنا 1 إلى 15 بالترتيب: شجرة BST عادية كانت ستصبح سلسلة بارتفاع 15')}>1 إلى 15 بالترتيب</button>
        <button className="tt-preset" onClick={() => {
          const r = mulberry32(seed); setSeed(seed + 1);
          const k = Array.from({ length: 60 }, (_, i) => i + 1);
          for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; }
          bulk(k.slice(0, 20), '20 مفتاحًا بترتيب عشوائي');
        }}>20 عشوائيًا 🎲</button>
      </div>

      <div className="tv-wrap"><TreeView root={f.root} hl={f.hl} mark={f.mark} path={f.path} showBal /></div>

      <div className="da-stats">
        <span>المفاتيح: <b className="ltr">{size(f.root)}</b></span>
        <span>ارتفاع AVL: <b className="ltr">{height(f.root)}</b></span>
        <span>BST عادية بالمفاتيح نفسها: <b className="ltr">{height(plain)}</b></span>
        <span>الحد: <bdi dir="ltr">1.44 log₂ n ≈ {(1.44 * Math.log2(Math.max(size(base), 1) + 2)).toFixed(1)}</bdi></span>
      </div>
      {rot && <div className="vm-help">هذا الإدراج احتاج إلى حالة <bdi dir="ltr" className="ltr"><b>{rot}</b></bdi>: {ROT_AR[rot]}.</div>}
      <div className="tt-side">
        <Pseudocode lines={AVL_PSEUDO} active={f.line} />
        <div className="tt-info"><div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}>{f.note}</div></div>
      </div>
      <div className="vm-help">الرقم فوق كل عقدة: <bdi dir="ltr">h(left) − h(right)</bdi>. في شجرة AVL يكون دائمًا −1 أو 0 أو +1، والأحمر يعني أنه صار ±2 ويحتاج إلى دوران.</div>
      <Player s={s} />
    </div>
  );
}

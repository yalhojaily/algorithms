import { useState } from 'react';
import { BST_PSEUDO, bstFrames, bstInsert, height, size, type BFrame, type BstOp, type TNode } from '../lib/bst';
import { mulberry32 } from '../lib/montecarlo';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';
import TreeView from './TreeView';

const build = (keys: number[]) => keys.reduce<TNode | null>((t, k) => bstInsert(t, k), null);
const START = build([50, 30, 70, 20, 40, 60, 80, 35, 45, 65]);
const one = (root: TNode | null, note: string): BFrame[] => [{ root, path: [], hl: null, line: 1, note, done: true }];
const OP_LABEL: Record<BstOp, string> = { search: 'SEARCH', insert: 'INSERT', delete: 'DELETE', inorder: 'INORDER' };

/** A binary search tree: search, insert, delete (all three cases) and in-order traversal, with the tree height. */
export default function BSTLab() {
  const [run, setRun] = useState<{ op: BstOp; frames: BFrame[] }>({ op: 'insert', frames: one(START, 'شجرة بحث ثنائية فيها 10 مفاتيح') });
  const [x, setX] = useState(42);
  const [seed, setSeed] = useState(2);
  const s = useStepper<BFrame>(run.frames, 2);
  const f = s.frame;
  const base = run.frames[run.frames.length - 1].root;
  const go = (op: BstOp) => setRun({ op, frames: record(bstFrames(base, op, x)) });
  const n = size(f.root), h = height(f.root);

  const preset = (kind: 'random' | 'sorted') => {
    if (kind === 'sorted') { setRun({ op: 'insert', frames: one(build(Array.from({ length: 15 }, (_, i) => (i + 1) * 5)), 'أدرجنا 5، 10، 15، … ، 75 بالترتيب: كل مفتاح أكبر مما قبله، فيذهب يمينًا دائمًا') }); return; }
    const r = mulberry32(seed); setSeed(seed + 1);
    const keys = Array.from({ length: 99 }, (_, i) => i + 1);
    for (let i = keys.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [keys[i], keys[j]] = [keys[j], keys[i]]; }
    setRun({ op: 'insert', frames: one(build(keys.slice(0, 15)), `أدرجنا 15 مفتاحًا بترتيب عشوائي: ${keys.slice(0, 15).join('، ')}`) });
  };

  return (
    <div className="widget card bst">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">شجرة البحث الثنائية</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <label className="hp-in"><span className="qg-label">x =</span><input type="number" min={1} max={99} value={x} onChange={(e) => setX(Math.max(1, Math.min(99, +e.target.value || 1)))} dir="ltr" /></label>
        {(['search', 'insert', 'delete'] as BstOp[]).map((op) => <button key={op} className="btn btn-sm" onClick={() => go(op)}>{OP_LABEL[op]}(x)</button>)}
        <button className="btn btn-sm" onClick={() => go('inorder')}>INORDER</button>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">ابدأ من جديد:</span>
        <button className="tt-preset" onClick={() => preset('random')}>15 مفتاحًا بترتيب عشوائي 🎲</button>
        <button className="tt-preset" onClick={() => preset('sorted')}>15 مفتاحًا بالترتيب</button>
      </div>

      <div className="tv-wrap"><TreeView root={f.root} hl={f.hl} mark={f.mark} path={f.path} /></div>
      {f.out && <div className="bst-out" dir="ltr">{f.out.map((k, i) => <span key={i}>{k}</span>)}</div>}

      <div className="da-stats">
        <span>العملية: <bdi dir="ltr">{OP_LABEL[run.op]}</bdi></span>
        <span>المفاتيح: <b className="ltr">{n}</b></span>
        <span>الارتفاع: <b className="ltr">{h}</b></span>
        <span>أقل ارتفاع ممكن: <b className="ltr">{Math.ceil(Math.log2(n + 1))}</b></span>
      </div>
      <div className="tt-side">
        <Pseudocode lines={BST_PSEUDO[run.op]} active={f.line} />
        <div className="tt-info"><div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}>{f.note}</div></div>
      </div>
      <Player s={s} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { BIP, COVER_DAG, bipNet, coverBip, coverPaths, matchingFrames, type Bip, type MatchFrame } from '../lib/flowapps';
import type { G } from '../lib/bookgraphs';
import { Player, useStepper } from '../engine/stepper';

const col = (b: Bip, side: 'L' | 'R', i: number) => {
  const nL = b.L.length, nR = b.R.length, h = Math.max(nL, nR) - 1;
  return side === 'L' ? (h - (nL - 1)) / 2 * 0.8 + i * 0.8 : (h - (nR - 1)) / 2 * 0.8 + i * 0.8;
};

/** Bipartite matching as Ford–Fulkerson: alternating paths in G are augmenting paths in G′. With cover, also the dag of 11.5. */
export default function MatchingLab({ cover = false }: { cover?: boolean }) {
  const b = useMemo(() => (cover ? coverBip(COVER_DAG) : BIP), [cover]), nL = b.L.length;
  const [view, setView] = useState<'g' | 'net' | 'dag'>(cover ? 'dag' : 'g');
  const frames = useMemo(() => matchingFrames(b), [b]);
  const st = useStepper<MatchFrame>(frames, 1);
  const f = st.frame, done = !f.path;
  const Ln = cover ? b.L.map((x) => x + '♭') : b.L, Rn = cover ? b.R.map((x) => x + '♯') : b.R;
  const bipG: G = {
    names: [...Ln, ...Rn],
    xy: [...b.L.map((_, i) => [0, col(b, 'L', i)] as [number, number]), ...b.R.map((_, j) => [2.6, col(b, 'R', j)] as [number, number])],
    edges: b.E.map(([i, j]) => [i, nL + j]),
  };
  const { E: NE, m0 } = bipNet(b);
  const netG: G = {
    names: ['s', ...Ln, ...Rn, 't'],
    xy: [[0, col(b, 'L', (nL - 1) / 2)], ...bipG.xy.map(([x, y]) => [x + 1.4, y] as [number, number]), [5.4, col(b, 'L', (nL - 1) / 2)]],
    edges: NE.map(([u, v]) => [u, v]),
  };
  const inM = (k: number) => f.M.includes(k), onP = (k: number) => f.pathEdges.includes(k);
  const bipK = (u: number, v: number) => b.E.findIndex(([i, j]) => i === u && nL + j === v);
  const S = f.S;
  // König: the minimum cut gives a vertex cover (L \ S) ∪ (R ∩ S)
  const coverV = S ? [...b.L.map((_, i) => !S[1 + i]), ...b.R.map((_, j) => S[1 + nL + j])] : null;
  const matchedL = new Set(f.M.map((k) => b.E[k][0])), matchedR = new Set(f.M.map((k) => b.E[k][1]));
  const end = f.path ? [f.path[0] - 1, f.path.at(-1)! - 1 - nL] : null;
  const dagPaths = cover ? coverPaths(COVER_DAG, f.M) : [];
  const dagPathOf = (u: number, v: number) => dagPaths.findIndex((p) => p.some((x, i) => x === u && p[i + 1] === v));
  const eKind = (k: number) => (onP(k) ? (inM(k) ? 'hot' : 'alt') : inM(k) ? 'mm' : '');
  return (
    <div className="widget card mt">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">{cover ? 'أصغر غطاء بمسارات منفصلة' : 'أكبر مطابقة ثنائية'}</span></div>
      <div className="rel-tabs">
        {cover && <button className={`pr-tab ${view === 'dag' ? 'on' : ''}`} onClick={() => setView('dag')}>الرسم G والمسارات</button>}
        <button className={`pr-tab ${view === 'g' ? 'on' : ''}`} onClick={() => setView('g')}>{cover ? <>الرسم الثنائي <bdi dir="ltr">G′</bdi></> : 'الرسم الثنائي G'}</button>
        <button className={`pr-tab ${view === 'net' ? 'on' : ''}`} onClick={() => setView('net')}>شبكة التدفق</button>
      </div>
      {view === 'dag' ? (
        <GraphSvg g={COVER_DAG} st={{ directed: true, scale: 70, r: 15,
          eClass: (u, v) => { const k = COVER_DAG.edges.findIndex(([a, c]) => a === u && c === v); if (onP(k)) return 'hot'; const p = dagPathOf(u, v); return p >= 0 ? `pc${(p % 4) + 1}` : ''; } }} />
      ) : view === 'g' ? (
        <GraphSvg g={bipG} st={{ scale: 64, r: 15,
          vClass: (v) => (coverV ? (coverV[v] ? 'c5' : '') : end && (v === end[0] || v === nL + end[1]) ? 'sel' : (v < nL ? matchedL.has(v) : matchedR.has(v - nL)) ? 'c2' : ''),
          eClass: (u, v) => eKind(bipK(u, v)) }} />
      ) : (
        <GraphSvg g={netG} st={{ directed: true, scale: 64, r: 14,
          vClass: (v) => (S ? (S[v] ? 'c1' : 'c3') : ''),
          eClass: (u, v) => { const k = NE.findIndex(([a, c]) => a === u && c === v); if (k >= m0 && k < m0 + b.E.length && onP(k - m0)) return 'hot'; return f.f[k] > 0 ? 'tree' : ''; } }} />
      )}
      {cover && view === 'dag' && <div className="dp-paths">{dagPaths.map((p, i) => <span key={i} className={`pc${(i % 4) + 1}`}><bdi dir="ltr">{p.map((v) => COVER_DAG.names[v]).join('→')}</bdi></span>)}</div>}
      <div className="edl-msg">
        {!done ? <>مسار متناوب من <bdi dir="ltr">{Ln[end![0]]}</bdi> (غير مطابق) إلى <bdi dir="ltr">{Rn[end![1]]}</bdi> (غير مطابق). الحواف المتقطعة تدخل M، والكهرمانية المتصلة تخرج منه: <bdi dir="ltr">M ← M ⊕ P</bdi>، فيكبر M بواحد.</>
          : cover ? <>لا مسار متناوب: المطابقة أكبر ما يمكن، حجمها {f.M.length}. فأصغر غطاء فيه <bdi dir="ltr">V − |M| = {nL} − {f.M.length} = {nL - f.M.length}</bdi> مسارًا.</>
          : <>لا مسار متناوب: M أكبر مطابقة، حجمها <b>{f.M.length}</b>. والقطع الأصغر يعطي غطاءً بالرؤوس (الحمراء) حجمه {coverV!.filter(Boolean).length} أيضًا: كل حافة تلمس رأسًا أحمر، فلا مطابقة أكبر من {f.M.length}.</>}
      </div>
      <div className="da-stats">
        <span><bdi dir="ltr">|M|</bdi>: <b className="ltr">{f.M.length}</b></span>
        {cover && <span>عدد المسارات: <b className="ltr">{nL - f.M.length}</b></span>}
        <span>التكرار: <b className="ltr">{Math.min(st.i + 1, frames.length - 1)}</b> من {frames.length - 1}</span>
      </div>
      <Player s={st} />
    </div>
  );
}

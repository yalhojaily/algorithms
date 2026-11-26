import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { DP_G, edgeNet, maxflowFrames, splitDrawing, splitNet, unitPaths, type MFrame } from '../lib/flowapps';
import { Player, useStepper } from '../engine/stepper';

type Mode = 'edge' | 'vertex';

/** Disjoint s→t paths by Ford–Fulkerson on unit capacities: edge-disjoint in G, vertex-disjoint through the split graph Ḡ. */
export default function DisjointPathsLab({ mode: m0 = 'edge', both = false }: { mode?: Mode; both?: boolean }) {
  const g = DP_G, nm = g.names, n = nm.length, s = 0, t = n - 1;
  const [mode, setMode] = useState<Mode>(m0);
  const [view, setView] = useState<'g' | 'split'>('split');
  const net = useMemo(() => (mode === 'edge' ? { n, E: edgeNet(g), inner: 0, src: s, snk: t } : { ...splitNet(g, s, t), src: 2 * s, snk: 2 * t + 1 }), [mode]);
  const frames = useMemo(() => maxflowFrames(net.n, net.E, net.src, net.snk), [net]);
  const st = useStepper<MFrame>(frames, 1);
  const f = st.frame, done = !f.aug;
  const paths = unitPaths(net.n, net.E, f.f, net.src, net.snk);
  // map to G
  const toG = (vs: number[]) => (mode === 'edge' ? vs : vs.filter((_, i) => i % 2 === 0).map((v) => v >> 1));
  const gPaths = paths.map((p) => toG(p.verts));
  const pathOf = (u: number, v: number) => gPaths.findIndex((p) => p.some((x, i) => x === u && p[i + 1] === v));
  const augE = new Set((f.aug?.edges ?? []).map(({ k }) => (mode === 'edge' ? k : k - net.inner)).filter((k) => k >= 0));
  const augV = new Set(mode === 'vertex' ? (f.aug?.edges ?? []).filter(({ k }) => k < net.inner).map(({ k }) => k) : []);
  const gIdx = (u: number, v: number) => g.edges.findIndex(([a, b]) => a === u && b === v);
  const S = f.S;
  const cutV = nm.map(() => false);
  if (mode === 'vertex' && S) net.E.forEach(([u, v], k) => {
    if (!(S[u] && !S[v])) return;
    if (k < net.inner) cutV[u >> 1] = true;                      // a split edge v_in → v_out: the vertex itself
    else cutV[(v >> 1) !== t ? v >> 1 : u >> 1] = true;           // an original edge u_out → v_in: take v (or u if v = t)
  });
  const cutE = (k: number) => {
    if (!S) return false;
    const [u, v] = net.E[k];
    return S[u] && !S[v];
  };
  const split = splitDrawing(g, s, t);
  const showSplit = mode === 'vertex' && view === 'split';
  const txt = (p: number[]) => p.map((v) => nm[v]).join('→');
  const augTxt = f.aug ? (mode === 'edge' ? txt(f.aug.verts) : f.aug.verts.map((v) => nm[v >> 1] + (v % 2 ? '⁺' : '⁻')).join('→')) : '';
  return (
    <div className="widget card dp">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">مسارات منفصلة بأكبر تدفق</span></div>
      {both && <div className="rel-tabs">
        <button className={`pr-tab ${mode === 'edge' ? 'on' : ''}`} onClick={() => setMode('edge')}>منفصلة الحواف</button>
        <button className={`pr-tab ${mode === 'vertex' ? 'on' : ''}`} onClick={() => setMode('vertex')}>منفصلة الرؤوس</button>
      </div>}
      {mode === 'vertex' && <div className="rel-tabs">
        <button className={`pr-tab ${view === 'split' ? 'on' : ''}`} onClick={() => setView('split')}>الرسم المشقوق <bdi dir="ltr">Ḡ</bdi></button>
        <button className={`pr-tab ${view === 'g' ? 'on' : ''}`} onClick={() => setView('g')}>الرسم الأصلي G</button>
      </div>}
      {showSplit ? (
        <GraphSvg g={split} st={{ directed: true, scale: 74, r: 11, label: (v) => (split.tag[v] === 'in' ? '⁻' : '⁺'),
          vClass: (v) => (S ? (cutV[v >> 1] ? 'c5' : S[v] ? 'c1' : 'c3') : ''),
          eClass: (u, v) => {
            const k = net.E.findIndex(([a, b]) => a === u && b === v);
            if (f.aug?.edges.some((e) => e.k === k)) return 'hot';
            if (cutE(k)) return 'cut';
            if (f.f[k] > 0) { const pi = paths.findIndex((p) => p.edges.includes(k)); return pi >= 0 ? `pc${pi + 1}` : 'tree'; }
            return '';
          } }} />
      ) : (
        <GraphSvg g={g} st={{ directed: true, scale: 74, r: 15,
          vClass: (v) => (cutV[v] ? 'c5' : augV.has(v) ? 'nb' : S && mode === 'edge' ? (S[v] ? 'c1' : 'c3') : ''),
          eClass: (u, v) => {
            const k = gIdx(u, v);
            if (augE.has(k)) return 'hot';
            if (mode === 'edge' && cutE(k)) return 'cut';
            const pi = pathOf(u, v);
            return pi >= 0 ? `pc${pi + 1}` : '';
          } }} />
      )}
      <div className="dp-paths">
        {gPaths.length === 0 ? <span>لا مسارات بعد.</span> : gPaths.map((p, i) => <span key={i} className={`pc${i + 1}`}><bdi dir="ltr">{txt(p)}</bdi></span>)}
      </div>
      <div className="edl-msg">
        {!done ? <>مسار تحسين في الرسم المتبقي: <bdi dir="ltr">{augTxt}</bdi>.{f.aug!.edges.some((e) => e.dir < 0) ? ' فيه حافة معكوسة، فيعيد توجيه مسار قديم.' : ''}</>
          : mode === 'edge' ? <>لا مسار تحسين: أكبر عدد من المسارات منفصلة الحواف هو <b>{f.value}</b>. والحواف السوداء المتقطعة قطع أصغر سعته {f.value}: احذفها فينفصل t عن s.</>
          : <>لا مسار تحسين: أكبر عدد من المسارات منفصلة الرؤوس هو <b>{f.value}</b>. والقطع الأصغر في <bdi dir="ltr">Ḡ</bdi> (الحواف السوداء المتقطعة) سعته {f.value}. وكل حافة فيه نستبدلها برأس: حافة شطر <bdi dir="ltr">v⁻→v⁺</bdi> هي الرأس v، وحافة أصلية <bdi dir="ltr">u⁺→v⁻</bdi> نأخذ لها v. فالرؤوس الحمراء <bdi dir="ltr">{nm.filter((_, v) => cutV[v]).join(', ')}</bdi>: احذفها فينفصل t عن s.</>}
      </div>
      <div className="da-stats">
        <span>المسارات: <b className="ltr">{f.value}</b></span>
        <span>التكرار: <b className="ltr">{Math.min(st.i + 1, frames.length - 1)}</b> من {frames.length - 1}</span>
      </div>
      <Player s={st} />
    </div>
  );
}

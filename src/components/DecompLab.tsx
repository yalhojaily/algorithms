import { useMemo } from 'react';
import GraphSvg from './GraphSvg';
import { FLOW_NET, cap, decomposeFrames, type DFrame } from '../lib/flow';
import { Player, useStepper } from '../engine/stepper';

/** A flow of value 10 plus a circulation around a→c→b→a, decomposed into weighted paths and cycles. */
export default function DecompLab() {
  const net = FLOW_NET, nm = net.names;
  const f0 = useMemo(() => {
    const f = [8, 2, 0, 8, 0, 2, 0, 8, 2];          // a feasible flow of value 10 (section 10.1)
    const cyc = [3, 4, 2];                          // a→c, c→b, b→a
    const room = Math.min(...cyc.map((k) => cap(net, k) - f[k]));
    for (const k of cyc) f[k] += room;
    return { f, room };
  }, [net]);
  const { room } = f0;
  const frames = useMemo(() => decomposeFrames(net, f0.f), [net, f0]);
  const s = useStepper<DFrame>(frames, 1);
  const fr = s.frame;
  const idx = (u: number, v: number) => net.edges.findIndex(([a, b]) => a === u && b === v);
  const pieceTxt = (p: NonNullable<DFrame['piece']>) => {
    const vs = [net.edges[p.edges[0]][0], ...p.edges.map((k) => net.edges[k][1])];
    return vs.map((v) => nm[v]).join('→');
  };
  return (
    <div className="widget card dc">
      <div className="widget-head"><span className="widget-kicker">المختبر التفاعلي</span><span className="widget-title">تحليل التدفق إلى مسارات ودورات</span></div>
      <GraphSvg g={net} st={{ directed: true, scale: 70, r: 15,
        eLabel: (u, v) => { const k = idx(u, v); return fr.f[k] ? String(fr.f[k]) : null; },
        eClass: (u, v) => { const k = idx(u, v); return fr.piece?.edges.includes(k) ? (fr.piece.kind === 'cycle' ? 'back' : 'hot') : fr.f[k] > 0 ? 'tree' : 'dim'; } }} />
      <div className="edl-msg">
        {s.i === 0 ? <>تدفق قيمته 10 (من القسم 10.1)، ومعه {room} وحدات تدور حول <bdi dir="ltr">a→c→b→a</bdi> (لا تغير القيمة). الأرقام على الحواف تدفقها.</>
          : fr.piece ? <>{fr.piece.kind === 'path' ? 'مسار' : 'دورة'} <bdi dir="ltr">{pieceTxt(fr.piece)}</bdi>، نطرح منه أصغر تدفق عليه: <b className="ltr">{fr.piece.amount}</b>. حافة واحدة على الأقل تصير صفرًا.</>
            : <>فرغ التدفق. القطع: {fr.done.length} (≤ E = {net.edges.length}).</>}
      </div>
      <div className="df-order" dir="ltr"><span className="lbl">pieces:</span>
        {fr.done.map((p, i) => <span key={i} className="v">{p.amount}·{pieceTxt(p)}{p.kind === 'cycle' ? ' ⟲' : ''}</span>)}
      </div>
      <Player s={s} />
    </div>
  );
}

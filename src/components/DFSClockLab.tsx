import { useMemo, useState } from 'react';
import GraphSvg from './GraphSvg';
import { DAG_G, DIR_G, dfsFrames, type DFrame, type DG } from '../lib/dfs';
import { Player, useStepper } from '../engine/stepper';

type GName = 'dir' | 'dag';
const GRAPHS: Record<GName, { g: DG; label: string }> = {
  dir: { g: DIR_G, label: 'رسم موجه فيه دورات' },
  dag: { g: DAG_G, label: 'رسم بلا دورات (dag)' },
};
const CLS_AR = { tree: 'شجرية', fwd: 'أمامية', back: 'خلفية', cross: 'عرضية' } as const;

/** The topological line: finished vertices in reverse postorder, every edge an arc pointing right. */
function TopoLine({ g, f }: { g: DG; f: DFrame }) {
  const order = [...f.post_order].reverse(), pos = new Map(order.map((v, i) => [v, i]));
  const n = g.names.length, gap = 54, W = n * gap + 20, H = 120, y = 92, X = (i: number) => 20 + i * gap + gap / 2 - (n - order.length) * 0;
  const arcs = g.edges.filter(([u, v]) => pos.has(u) && pos.has(v));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="gv-svg" style={{ maxWidth: W * 1.2 }} direction="ltr">
      {arcs.map(([u, v], k) => {
        const a = X(pos.get(u)!), b = X(pos.get(v)!), h = Math.min(70, 14 + Math.abs(b - a) * 0.35), ok = a < b;
        return (
          <g key={k} className={`gv-e dir ${ok ? 'tree' : 'back'}`}>
            <path d={`M${a},${y - 13} C${a},${y - h} ${b},${y - h} ${b},${y - 22}`} />
            <polygon points={`${b},${y - 13} ${b - 4.5},${y - 22} ${b + 4.5},${y - 22}`} />
          </g>
        );
      })}
      {order.map((v, i) => (
        <g key={v} className="gv-n st-done"><circle cx={X(i)} cy={y} r={13} /><text x={X(i)} y={y} dy="0.35em">{g.names[v]}</text></g>
      ))}
    </svg>
  );
}

/** DFSAll with a clock: starting and finishing times, vertex states, and the four edge classes. */
export default function DFSClockLab({ graph: g0 = 'dir', topo = false, cycle = false }: { graph?: GName; topo?: boolean; cycle?: boolean }) {
  const [gn, setGn] = useState<GName>(g0);
  const g = GRAPHS[gn].g, n = g.names.length;
  const frames = useMemo(() => dfsFrames(g), [g]);
  const s = useStepper<DFrame>(frames, 3);
  const f = s.frame, nm = (x: number) => g.names[x];
  const T = 2 * n;
  const lastCls = f.edge ? f.cls[`${f.edge[0]},${f.edge[1]}`] : null;
  const firstBack = frames.findIndex((x) => x.cycle);
  const msg = (() => {
    if (f.msg === 'start') return <>نستدعي <bdi dir="ltr">DFS({nm(f.cur)})</bdi>: الساعة {f.clock}، فـ <bdi dir="ltr">{nm(f.cur)}.pre = {f.clock}</bdi>، و{nm(f.cur)} نشط الآن.</>;
    if (f.msg === 'edge' && f.edge && lastCls) {
      const [u, v] = f.edge, st = lastCls === 'tree' ? 'جديد' : lastCls === 'back' ? 'نشط (على مكدس الاستدعاء)' : 'منتهٍ';
      return <>الحافة <bdi dir="ltr">{nm(u)}→{nm(v)}</bdi>: {nm(v)} {st}، فهي حافة <b>{CLS_AR[lastCls]}</b>.{lastCls === 'back' ? ' وهذه دورة: من ' + nm(v) + ' مسار شجري إلى ' + nm(u) + '، ثم الحافة تعود.' : lastCls === 'fwd' ? ' (' + nm(v) + ' من نسل ' + nm(u) + ' وصلنا إليه من طريق آخر.)' : ''}</>;
    }
    if (f.msg === 'finish') return <>انتهت <bdi dir="ltr">DFS({nm(f.cur)})</bdi>: <bdi dir="ltr">{nm(f.cur)}.post = {f.clock}</bdi>. يُضاف {nm(f.cur)} إلى الترتيب البعدي.</>;
    return <>انتهى البحث. {f.cycle ? 'وُجدت حافة خلفية واحدة على الأقل: في الرسم دورة.' : 'لا حواف خلفية: الرسم بلا دورات، وعكس الترتيب البعدي ترتيب طوبولوجي.'}</>;
  })();
  return (
    <div className="widget card df">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">{topo ? 'الترتيب الطوبولوجي من الترتيب البعدي' : 'البحث بالعمق بساعة'}</span>
      </div>
      <div className="rel-tabs wf-tabs">
        {(Object.keys(GRAPHS) as GName[]).map((k) => <button key={k} className={`pr-tab ${gn === k ? 'on' : ''}`} onClick={() => setGn(k)}>{GRAPHS[k].label}</button>)}
      </div>
      <GraphSvg g={g} st={{
        directed: true, scale: 64, r: 14, weights: false,
        vClass: (v) => `st-${f.status[v]} ${v === f.cur ? 'cur' : ''}`,
        eClass: (u, v) => (f.edge && f.edge[0] === u && f.edge[1] === v ? `hot` : f.cls[`${u},${v}`] ?? ''),
        label: (v) => (f.pre[v] ? `${f.pre[v]}/${f.post[v] || '·'}` : null),
      }} />
      <div className="df-legend">
        <span><i className="tree" />شجرية</span><span><i className="fwd" />أمامية</span><span><i className="back" />خلفية</span><span><i className="cross" />عرضية</span>
        <span>الرأس: أبيض جديد، كهرماني نشط، رمادي منتهٍ</span>
      </div>
      {topo ? (
        <>
          <div className="vm-help">كلما انتهى رأس وضعناه في أول السطر. فالسطر عكس الترتيب البعدي، وكل حافة بين رأسين فيه تشير إلى اليمين{gn === 'dir' ? '، إلا في رسم فيه دورة' : ''}:</div>
          <TopoLine g={g} f={f} />
        </>
      ) : (
        <div className="df-time" dir="ltr">
          {g.names.map((c, v) => (
            <div className="df-row" key={v}>
              <span>{c}</span>
              <div className="df-track">
                {f.pre[v] > 0 && <div className={`df-bar ${f.post[v] ? '' : 'open'}`} style={{ left: `${((f.pre[v] - 1) / T) * 100}%`, width: `${(((f.post[v] || f.clock) - f.pre[v] + 1) / T) * 100}%` }} />}
              </div>
            </div>
          ))}
          <div className="df-axis"><span /><div><span>1</span><span>{n}</span><span>{T}</span></div></div>
        </div>
      )}
      <div className="df-order" dir="ltr">
        <span className="lbl">stack:</span>{f.stack.length ? f.stack.map((v) => <span key={v} className="v on">{nm(v)}</span>) : <span className="lbl">—</span>}
      </div>
      <div className="df-order" dir="ltr">
        <span className="lbl">postorder:</span>{f.post_order.map((v) => <span key={v} className="v">{nm(v)}</span>)}
      </div>
      <div className="edl-msg">{msg}</div>
      {cycle && firstBack >= 0 && <button className="btn btn-sm" onClick={() => s.go(firstBack)}>اقفز إلى أول حافة خلفية</button>}
      <Player s={s} />
    </div>
  );
}

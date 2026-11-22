import type { G } from '../lib/bookgraphs';

export interface GraphStyle {
  vClass?: (v: number) => string;
  eClass?: (u: number, v: number) => string;
  label?: (v: number) => string | null;
  onClick?: (v: number) => void;
  weights?: boolean;
  scale?: number;
  r?: number;
}

/** Draws an undirected graph from its coordinates (in grid units). */
export default function GraphSvg({ g, st = {} }: { g: G; st?: GraphStyle }) {
  const S = st.scale ?? 70, R = st.r ?? 14, pad = R + 6, top = st.label ? pad + 14 : pad;
  const xs = g.xy.map((p) => p[0]), ys = g.xy.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const W = (Math.max(...xs) - x0) * S + 2 * pad, H = (Math.max(...ys) - y0) * S + pad + top;
  const X = (v: number) => (g.xy[v][0] - x0) * S + pad, Y = (v: number) => (g.xy[v][1] - y0) * S + top;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="gv-svg" style={{ maxWidth: W * 1.25 }} direction="ltr">
      {g.edges.map(([u, v, w], k) => (
        <g key={k} className={`gv-e ${st.eClass?.(u, v) ?? ''}`}>
          <line x1={X(u)} y1={Y(u)} x2={X(v)} y2={Y(v)} />
          {st.weights && w != null && (
            <text x={(X(u) + X(v)) / 2} y={(Y(u) + Y(v)) / 2} dy="-3">{w}</text>
          )}
        </g>
      ))}
      {g.names.map((nm, v) => (
        <g key={v} className={`gv-n ${st.vClass?.(v) ?? ''} ${st.onClick ? 'click' : ''}`} onClick={() => st.onClick?.(v)}>
          <circle cx={X(v)} cy={Y(v)} r={R} />
          <text x={X(v)} y={Y(v)} dy="0.35em">{nm}</text>
          {st.label?.(v) != null && <text className="gv-lab" x={X(v)} y={Y(v) - R - 4}>{st.label!(v)}</text>}
        </g>
      ))}
    </svg>
  );
}

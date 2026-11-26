import type { G } from '../lib/bookgraphs';

export interface GraphStyle {
  vClass?: (v: number) => string;
  eClass?: (u: number, v: number) => string;
  label?: (v: number) => string | null;
  labelBelow?: (v: number) => boolean;
  onClick?: (v: number) => void;
  weights?: boolean;
  directed?: boolean;
  eLabel?: (u: number, v: number) => string | null;
  scale?: number;
  r?: number;
}

/** Draws an undirected graph from its coordinates (in grid units). */
export default function GraphSvg({ g, st = {} }: { g: G; st?: GraphStyle }) {
  const S = st.scale ?? 70, R = st.r ?? 14, pad = R + 6, top = st.label ? pad + 14 : pad;
  const xs = g.xy.map((p) => p[0]), ys = g.xy.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const W = (Math.max(...xs) - x0) * S + 2 * pad, H = (Math.max(...ys) - y0) * S + pad + top + (st.labelBelow ? 14 : 0);
  const X = (v: number) => (g.xy[v][0] - x0) * S + pad, Y = (v: number) => (g.xy[v][1] - y0) * S + top;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="gv-svg" style={{ maxWidth: W * 1.25 }} direction="ltr">
      {g.edges.map(([u, v, w], k) => {
        const cls = `gv-e ${st.eClass?.(u, v) ?? ''}`;
        const lab = st.eLabel?.(u, v) ?? (st.weights && w != null ? String(w) : null);
        if (!st.directed) return (
          <g key={k} className={cls}>
            <line x1={X(u)} y1={Y(u)} x2={X(v)} y2={Y(v)} />
            {lab != null && <text x={(X(u) + X(v)) / 2} y={(Y(u) + Y(v)) / 2} dy="-3">{lab}</text>}
          </g>
        );
        // directed: shorten to the circles, bend when the reverse edge exists
        const x1 = X(u), y1 = Y(u), x2 = X(v), y2 = Y(v), dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
        const bend = g.edges.some(([a, b]) => a === v && b === u) ? 0.22 * L : 0;
        const nx = -dy / L, ny = dx / L, cx = (x1 + x2) / 2 + nx * bend, cy = (y1 + y2) / 2 + ny * bend;
        const ang1 = Math.atan2(cy - y1, cx - x1), ang2 = Math.atan2(y2 - cy, x2 - cx);
        const sx = x1 + Math.cos(ang1) * R, sy = y1 + Math.sin(ang1) * R;
        const ex = x2 - Math.cos(ang2) * (R + 1), ey = y2 - Math.sin(ang2) * (R + 1);
        const A = 9, hw = 4.5, bx = ex - Math.cos(ang2) * A, by = ey - Math.sin(ang2) * A;
        const head = `${ex},${ey} ${bx - Math.sin(ang2) * hw},${by + Math.cos(ang2) * hw} ${bx + Math.sin(ang2) * hw},${by - Math.cos(ang2) * hw}`;
        const mx = 0.25 * sx + 0.5 * cx + 0.25 * bx, my = 0.25 * sy + 0.5 * cy + 0.25 * by;
        return (
          <g key={k} className={`${cls} dir`}>
            <path d={`M${sx},${sy} Q${cx},${cy} ${bx},${by}`} />
            <polygon points={head} />
            {lab != null && <text x={mx} y={my} dy="-3">{lab}</text>}
          </g>
        );
      })}
      {g.names.map((nm, v) => (
        <g key={v} className={`gv-n ${st.vClass?.(v) ?? ''} ${st.onClick ? 'click' : ''}`} onClick={() => st.onClick?.(v)}>
          <circle cx={X(v)} cy={Y(v)} r={R} />
          <text x={X(v)} y={Y(v)} dy="0.35em">{nm}</text>
          {st.label?.(v) != null && <text className="gv-lab" x={X(v)} y={st.labelBelow?.(v) ? Y(v) + R + 12 : Y(v) - R - 4}>{st.label!(v)}</text>}
        </g>
      ))}
    </svg>
  );
}

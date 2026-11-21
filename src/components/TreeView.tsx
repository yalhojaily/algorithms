import type { TNode } from '../lib/bst';

interface P { x: number; y: number; n: TNode; px?: number; py?: number }

/** Draws a binary tree: x by in-order position, y by depth. */
export default function TreeView({ root, hl, mark, path = [], showBal = false, maxW = 640 }: {
  root: TNode | null; hl?: number | null; mark?: number | null; path?: number[]; showBal?: boolean; maxW?: number;
}) {
  const pts: P[] = [];
  let i = 0, depth = 0;
  const walk = (t: TNode | null, d: number, px?: number, py?: number) => {
    if (!t) return;
    const me: P = { x: 0, y: d, n: t, px, py };
    walk(t.left, d + 1);
    me.x = i++;
    pts.push(me);
    depth = Math.max(depth, d);
    walk(t.right, d + 1);
  };
  walk(root, 0);
  const byKey = new Map(pts.map((p) => [p.n.key, p]));
  const n = Math.max(pts.length, 1);
  const W = Math.min(maxW, Math.max(260, n * 40));
  const dx = W / n;
  const LH = 52;
  const H = (depth + 1) * LH + 16;
  const X = (x: number) => dx * (x + 0.5);
  const Y = (y: number) => 22 + y * LH;
  const R = Math.min(16, dx * 0.42);
  const edges: { a: P; b: P }[] = [];
  for (const p of pts) for (const c of [p.n.left, p.n.right]) if (c) edges.push({ a: p, b: byKey.get(c.key)! });
  const onPath = new Set(path);
  const hb = (t: TNode | null) => (t ? t.h : 0);

  if (!root) return <div className="tv-empty">الشجرة فارغة</div>;
  return (
    <svg className="tv" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }} direction="ltr">
      {edges.map(({ a, b }) => (
        <line key={`${a.n.key}-${b.n.key}`} x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(b.y)} className={`tv-edge ${onPath.has(a.n.key) && onPath.has(b.n.key) ? 'on' : ''}`} />
      ))}
      {pts.map((p) => {
        const k = p.n.key;
        const b = hb(p.n.left) - hb(p.n.right);
        const cls = k === hl ? 'hl' : k === mark ? 'mk' : onPath.has(k) ? 'path' : '';
        return (
          <g key={k} className={`tv-node ${cls} ${showBal && Math.abs(b) > 1 ? 'bad' : ''}`}>
            <circle cx={X(p.x)} cy={Y(p.y)} r={R} />
            <text x={X(p.x)} y={Y(p.y) + 4} textAnchor="middle" style={{ fontSize: Math.min(12, R * 0.8) }}>{k}</text>
            {showBal && <text x={X(p.x)} y={Y(p.y) - R - 3} textAnchor="middle" className={`tv-bal ${Math.abs(b) > 1 ? 'bad' : b === 0 ? 'zero' : ''}`}>{b > 0 ? `+${b}` : b < 0 ? `−${-b}` : '0'}</text>}
          </g>
        );
      })}
    </svg>
  );
}

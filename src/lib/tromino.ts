// Tiling a 2^k × 2^k board with one missing square using L-shaped trominoes.
// The induction proof in lesson 0.6, run as a recursive algorithm.

export interface Piece { id: number; level: number; cells: [number, number][] }

export interface TileFrame {
  line: number;
  pieces: Piece[];
  /** The sub-board being worked on: [top, left, size]. */
  region: [number, number, number];
  depth: number;
  calls: number;
  note: string;
}

export const TILE_PSEUDO = [
  'TILE(board of size 2ᵏ × 2ᵏ, missing square m):',
  '  if k = 0: return            // a 1×1 board: just the missing square',
  '  split the board into 4 quadrants of size 2ᵏ⁻¹',
  '  place one L at the center, covering the center',
  '      square of each quadrant that does NOT contain m',
  '  TILE(each quadrant, its missing square)',
  '      // = m, or the square the L just covered',
];

/** Plain recursive tiling: returns the board as ids (0 = the missing square). */
export function tile(k: number, mr: number, mc: number): number[][] {
  const n = 2 ** k;
  const B = Array.from({ length: n }, () => Array(n).fill(0));
  let next = 1;
  const go = (top: number, left: number, size: number, r: number, c: number) => {
    if (size === 1) return;
    const h = size / 2;
    const id = next++;
    const quads: [number, number][] = [[top, left], [top, left + h], [top + h, left], [top + h, left + h]];
    const centers: [number, number][] = [[top + h - 1, left + h - 1], [top + h - 1, left + h], [top + h, left + h - 1], [top + h, left + h]];
    const holes = quads.map(([qt, ql], q) => {
      const inside = r >= qt && r < qt + h && c >= ql && c < ql + h;
      if (inside) return [r, c] as [number, number];
      B[centers[q][0]][centers[q][1]] = id;
      return centers[q];
    });
    quads.forEach(([qt, ql], q) => go(qt, ql, h, holes[q][0], holes[q][1]));
  };
  go(0, 0, n, mr, mc);
  return B;
}

/** The same algorithm, recording a frame for every split and every L placed. */
export function* tileSteps(k: number, mr: number, mc: number): Generator<TileFrame> {
  const pieces: Piece[] = [];
  let calls = 0;
  const n = 2 ** k;
  const snap = (f: Omit<TileFrame, 'pieces' | 'calls'>): TileFrame => ({ ...f, pieces: [...pieces], calls });
  function* go(top: number, left: number, size: number, r: number, c: number, depth: number): Generator<TileFrame> {
    calls++;
    if (size === 1) return;
    const h = size / 2;
    yield snap({ line: 3, region: [top, left, size], depth, note: `لوح ${size}×${size}: نقسمه إلى أربعة أرباع، كل منها ${h}×${h}.` });
    const quads: [number, number][] = [[top, left], [top, left + h], [top + h, left], [top + h, left + h]];
    const centers: [number, number][] = [[top + h - 1, left + h - 1], [top + h - 1, left + h], [top + h, left + h - 1], [top + h, left + h]];
    const cells: [number, number][] = [];
    const holes = quads.map(([qt, ql], q) => {
      const inside = r >= qt && r < qt + h && c >= ql && c < ql + h;
      if (inside) return [r, c] as [number, number];
      cells.push(centers[q]);
      return centers[q];
    });
    pieces.push({ id: pieces.length + 1, level: depth, cells });
    yield snap({ line: 4, region: [top, left, size], depth, note: `قطعة L في المركز: الآن في كل ربع مربع واحد مشغول بالضبط، فكل ربع مسألة من الحجم الأصغر نفسه.` });
    for (let q = 0; q < 4; q++) yield* go(quads[q][0], quads[q][1], h, holes[q][0], holes[q][1], depth + 1);
  }
  yield snap({ line: 1, region: [0, 0, n], depth: 0, note: `لوح ${n}×${n} فيه ${n * n} مربعًا، أحدها محجوز. نحتاج ${(n * n - 1) / 3} قطعة.` });
  yield* go(0, 0, n, mr, mc, 0);
  yield snap({ line: 6, region: [0, 0, n], depth: 0, note: `اكتمل التبليط: ${pieces.length} قطعة، و${calls} استدعاء.` });
}

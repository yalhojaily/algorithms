import { describe, expect, it } from 'vitest';
import { tile, tileSteps } from '../src/lib/tromino';

function valid(B: number[][], mr: number, mc: number) {
  const n = B.length;
  const cells = new Map<number, [number, number][]>();
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const id = B[r][c];
      if (id === 0) { if (r !== mr || c !== mc) return false; continue; }
      cells.set(id, [...(cells.get(id) ?? []), [r, c]]);
    }
  if (cells.size !== (n * n - 1) / 3) return false;
  for (const cs of cells.values()) {
    if (cs.length !== 3) return false;
    const rs = cs.map((x) => x[0]), ks = cs.map((x) => x[1]);
    if (Math.max(...rs) - Math.min(...rs) !== 1 || Math.max(...ks) - Math.min(...ks) !== 1) return false;
  }
  return true;
}

describe('L-tromino tiling', () => {
  it('tiles every board with every missing square (k ≤ 3)', () => {
    for (let k = 0; k <= 3; k++)
      for (let r = 0; r < 2 ** k; r++)
        for (let c = 0; c < 2 ** k; c++) expect(valid(tile(k, r, c), r, c)).toBe(true);
  });
  it('the step version places (4^k − 1)/3 pieces', () => {
    let last;
    for (const f of tileSteps(3, 5, 2)) last = f;
    expect(last!.pieces.length).toBe(21);
  });
});

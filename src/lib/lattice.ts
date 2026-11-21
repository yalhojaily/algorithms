// Book 0.2: Fibonacci's lattice multiplication, column by column (increasing significance).

/** Digits of a non-negative integer, least significant first: 934 → [4, 3, 9]. */
export const digitsLE = (x: number): number[] => String(Math.max(0, Math.floor(x))).split('').reverse().map(Number);

export interface LFrame {
  k: number;                       // current column (power of ten); -1 before the first
  cells: [number, number][];       // the (i, j) with i + j = k
  holdBefore: number;
  sum: number;                     // hold after adding the column
  Z: (number | null)[];            // output digits so far
  carry: number;                   // ⌊sum/10⌋
  mults: number;                   // single-digit multiplications so far
}

export function latticeFrames(x: number, y: number): LFrame[] {
  const X = digitsLE(x), Y = digitsLE(y), m = X.length, n = Y.length;
  const Z: (number | null)[] = Array(m + n).fill(null);
  const out: LFrame[] = [{ k: -1, cells: [], holdBefore: 0, sum: 0, Z: [...Z], carry: 0, mults: 0 }];
  let hold = 0, mults = 0;
  for (let k = 0; k < m + n; k++) {
    const cells: [number, number][] = [];
    const before = hold;
    for (let i = 0; i < m; i++) {
      const j = k - i;
      if (j >= 0 && j < n) { cells.push([i, j]); hold += X[i] * Y[j]; mults++; }
    }
    const sum = hold;
    Z[k] = hold % 10;
    hold = Math.floor(hold / 10);
    out.push({ k, cells, holdBefore: before, sum, Z: [...Z], carry: hold, mults });
  }
  return out;
}

/** The result read from the Z digits (most significant first), without leading zeros. */
export const fromDigitsLE = (Z: (number | null)[]): string => {
  const s = Z.map((d) => d ?? 0).reverse().join('').replace(/^0+(?=\d)/, '');
  return s;
};

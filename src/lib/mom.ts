// Book 1.8: the median-of-medians pivot, laid out as Erickson's grid (one column per block).

export interface MomGrid {
  b: number;                 // block size (3 or 5)
  cols: number[][];          // each column sorted top (small) to bottom (large), columns sorted by their median
  raw: number[][];           // the blocks as they appear in the input
  mom: number;
  momCol: number;            // index of mom's column in `cols`
  mid: number;               // row of the medians
  smaller: Set<number>;      // values guaranteed smaller than mom by the grid argument
  larger: Set<number>;
  rank: number;              // rank of mom in the whole array (1-based)
}

export function momGrid(A: number[], b: number): MomGrid {
  const raw: number[][] = [];
  for (let i = 0; i < A.length; i += b) raw.push(A.slice(i, i + b));
  const sortedCols = raw.map((c) => c.slice().sort((x, y) => x - y));
  const mid = (b - 1) >> 1;
  const cols = sortedCols.slice().sort((p, q) => p[mid] - q[mid]);
  const momCol = (cols.length - 1) >> 1;
  const mom = cols[momCol][mid];
  const smaller = new Set<number>(), larger = new Set<number>();
  cols.forEach((c, j) => c.forEach((v, i) => {
    if (j <= momCol && i <= mid && v !== mom) smaller.add(v);
    if (j >= momCol && i >= mid && v !== mom) larger.add(v);
  }));
  const rank = A.filter((v) => v < mom).length + 1;
  return { b, cols, raw: raw.map((c) => c.slice()), mom, momCol, mid, smaller, larger, rank };
}

/** Distinct values 1..range in random order, n of them. */
export function distinctArray(n: number, seed: number): number[] {
  let s = seed * 2654435761 % 4294967296;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const vals = Array.from({ length: 99 }, (_, i) => i + 1);
  for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [vals[i], vals[j]] = [vals[j], vals[i]]; }
  return vals.slice(0, n);
}

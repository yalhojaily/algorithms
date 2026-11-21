// Book 2.1: Gauss and Laquière's backtracking for n queens, recorded event by event.

export type QEvent = 'try' | 'place' | 'solution' | 'dead' | 'done';

export interface QFrame {
  ev: QEvent;
  Q: number[];          // Q[0..r-1] = column (1-based) of the queen in rows 1..r
  r: number;            // row being filled (1-based)
  j: number;            // candidate column (1-based), 0 if none
  attackedBy: number;   // row of the queen that attacks (r, j), 0 if the square is legal
  solutions: number;
  nodes: number;        // recursive calls so far (legal partial solutions)
  last?: number[];      // the latest complete solution
}

/** Does the queen at (i, Q[i-1]) attack square (r, j)? Uses the book's test. */
export const attacks = (Q: number[], i: number, r: number, j: number) => {
  const q = Q[i - 1];
  return q === j || q === j + r - i || q === j - r + i;
};

/** Frames of PlaceQueens. With `verbose` every illegal try is a frame; otherwise only legal steps. */
export function queensFrames(n: number, verbose: boolean, max = 6000): QFrame[] {
  const out: QFrame[] = [];
  const Q: number[] = [];
  let solutions = 0, nodes = 0, last: number[] | undefined;
  const push = (f: Omit<QFrame, 'Q' | 'solutions' | 'nodes' | 'last'>) => {
    if (out.length < max) out.push({ ...f, Q: [...Q], solutions, nodes, last });
  };
  const place = (r: number) => {
    nodes++;
    if (r === n + 1) { solutions++; last = [...Q]; push({ ev: 'solution', r, j: 0, attackedBy: 0 }); return; }
    let any = false;
    for (let j = 1; j <= n; j++) {
      let by = 0;
      for (let i = 1; i < r; i++) if (attacks(Q, i, r, j)) { by = i; break; }
      if (by) { if (verbose) push({ ev: 'try', r, j, attackedBy: by }); continue; }
      any = true;
      Q[r - 1] = j;
      push({ ev: 'place', r, j, attackedBy: 0 });
      place(r + 1);
      Q.length = r - 1;
    }
    if (!any) push({ ev: 'dead', r, j: 0, attackedBy: 0 });
  };
  place(1);
  out.push({ ev: 'done', Q: [], r: 0, j: 0, attackedBy: 0, solutions, nodes, last });
  return out;
}

/** All solutions (each as 1-based columns per row). */
export function allQueens(n: number): number[][] {
  const res: number[][] = [], Q: number[] = [];
  const go = (r: number) => {
    if (r === n + 1) { res.push([...Q]); return; }
    for (let j = 1; j <= n; j++) {
      let ok = true;
      for (let i = 1; i < r; i++) if (attacks(Q, i, r, j)) { ok = false; break; }
      if (ok) { Q[r - 1] = j; go(r + 1); Q.length = r - 1; }
    }
  };
  go(1);
  return res;
}

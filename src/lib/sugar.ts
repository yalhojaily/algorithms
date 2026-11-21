// Book 2.2: the "fake-sugar-packet" game, solved by PlayAnyGame (with a memo so the widget is instant).
// Horace's token i lives in row i and moves right; position h[i] ∈ 0..n+1 (0 = left border, n+1 = off).
// Vera's token j lives in column j and moves down; position v[j] ∈ 0..n+1 (0 = top border, n+1 = off).

export type Player = 'H' | 'V';
export interface GState { n: number; h: number[]; v: number[]; turn: Player }
export interface GMove { token: number; from: number; to: number; jump: boolean }

export const start = (n: number, turn: Player = 'H'): GState => ({ n, h: Array(n).fill(0), v: Array(n).fill(0), turn });

const allOff = (p: number[], n: number) => p.every((x) => x === n + 1);
export const winner = (s: GState): Player | null => (allOff(s.h, s.n) ? 'H' : allOff(s.v, s.n) ? 'V' : null);

/** Who sits on the interior square (row, col), 1-based? */
export function occupant(s: GState, row: number, col: number): Player | null {
  if (s.h[row - 1] === col) return 'H';
  if (s.v[col - 1] === row) return 'V';
  return null;
}

export function moves(s: GState): GMove[] {
  const { n } = s, out: GMove[] = [];
  const mine = s.turn === 'H' ? s.h : s.v;
  for (let t = 0; t < n; t++) {
    const p = mine[t];
    if (p === n + 1) continue;
    // the square one step ahead, as (row, col) on the interior
    const sq = (q: number) => (s.turn === 'H' ? [t + 1, q] : [q, t + 1]);
    const free = (q: number) => q === n + 1 || occupant(s, sq(q)[0], sq(q)[1]) === null;
    const other = s.turn === 'H' ? 'V' : 'H';
    if (free(p + 1)) out.push({ token: t, from: p, to: p + 1, jump: false });
    else if (p + 1 <= n && occupant(s, sq(p + 1)[0], sq(p + 1)[1]) === other && p + 2 <= n + 1 && free(p + 2))
      out.push({ token: t, from: p, to: p + 2, jump: true });
  }
  return out;
}

export function apply(s: GState, m: GMove | null): GState {
  const h = [...s.h], v = [...s.v];
  if (m) (s.turn === 'H' ? h : v)[m.token] = m.to;
  return { n: s.n, h, v, turn: s.turn === 'H' ? 'V' : 'H' };
}

const key = (s: GState) => `${s.turn}${s.h.join('')}|${s.v.join('')}`;

/** PlayAnyGame: is s good for the player to move? Memoised only for speed; the logic is the book's. */
export function makeSolver() {
  const memo = new Map<string, boolean>();
  let calls = 0;
  const good = (s: GState): boolean => {
    const k = key(s);
    const c = memo.get(k);
    if (c !== undefined) return c;
    calls++;
    const w = winner(s);
    let res: boolean;
    if (w) res = w === s.turn;
    else {
      const ms = moves(s);
      if (ms.length === 0) res = !good(apply(s, null));      // pass
      else res = ms.some((m) => !good(apply(s, m)));
    }
    memo.set(k, res);
    return res;
  };
  return { good, states: () => calls };
}

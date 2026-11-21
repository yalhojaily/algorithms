// Tower of Hanoi (book 1.3): every move together with the chain of recursive calls that made it.

export interface HMove { disk: number; from: number; to: number; stack: string[] }
export interface HFrame { pegs: number[][]; move: HMove | null; k: number; total: number }

const NAME = ['A', 'B', 'C'];

export function hanoiMoves(n: number): HMove[] {
  const out: HMove[] = [];
  const stack: string[] = [];
  const go = (k: number, src: number, dst: number, tmp: number) => {
    if (k === 0) return;
    stack.push(`Hanoi(${k}, ${NAME[src]}, ${NAME[dst]}, ${NAME[tmp]})`);
    go(k - 1, src, tmp, dst);
    out.push({ disk: k, from: src, to: dst, stack: stack.slice() });
    go(k - 1, tmp, dst, src);
    stack.pop();
  };
  go(n, 0, 2, 1);
  return out;
}

export function hanoiFrames(n: number): HFrame[] {
  const pegs: number[][] = [Array.from({ length: n }, (_, i) => n - i), [], []];
  const moves = hanoiMoves(n);
  const frames: HFrame[] = [{ pegs: pegs.map((p) => p.slice()), move: null, k: 0, total: moves.length }];
  moves.forEach((m, i) => {
    const d = pegs[m.from].pop()!;
    if (d !== m.disk) throw new Error('bad move');
    const top = pegs[m.to][pegs[m.to].length - 1];
    if (top !== undefined && top < d) throw new Error('illegal move');
    pegs[m.to].push(d);
    frames.push({ pegs: pegs.map((p) => p.slice()), move: m, k: i + 1, total: moves.length });
  });
  return frames;
}

export const PEG = NAME;

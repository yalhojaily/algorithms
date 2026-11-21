// Dynamic-array simulation for lessons 2.1 and 2.2: grow and shrink policies, and the cost of every operation.

export type Grow = 'x2' | 'x1.5' | 'plus1' | 'plus8';
export type Shrink = 'none' | 'half' | 'quarter';

export const GROW: { key: Grow; label: string; next: (cap: number) => number }[] = [
  { key: 'x2', label: 'ضاعف السعة (×2)', next: (c) => Math.max(1, 2 * c) },
  { key: 'x1.5', label: 'اضرب في 1.5', next: (c) => Math.max(c + 1, Math.ceil(1.5 * c)) },
  { key: 'plus1', label: 'زد خانة واحدة (+1)', next: (c) => c + 1 },
  { key: 'plus8', label: 'زد 8 خانات (+8)', next: (c) => c + 8 },
];

export const SHRINK: { key: Shrink; label: string }[] = [
  { key: 'none', label: 'لا تصغير' },
  { key: 'half', label: 'نصّف حين يصبح نصفها فارغًا' },
  { key: 'quarter', label: 'نصّف حين يصبح ربعها فقط ممتلئًا' },
];

export type Op = 'push' | 'pop';

export interface Step {
  op: Op;
  size: number;      // after the operation
  cap: number;       // after the operation
  copies: number;    // elements copied by a resize during this operation
  cost: number;      // 1 for the write/remove itself + copies
  resized: '' | 'grow' | 'shrink';
}

export function simulate(ops: Op[], grow: Grow, shrink: Shrink, startCap = 1): Step[] {
  const g = GROW.find((x) => x.key === grow)!;
  let size = 0, cap = startCap;
  const out: Step[] = [];
  for (const op of ops) {
    let copies = 0, resized: Step['resized'] = '';
    if (op === 'push') {
      if (size === cap) { copies = size; cap = g.next(cap); resized = 'grow'; }
      size++;
    } else {
      if (size === 0) { out.push({ op, size, cap, copies: 0, cost: 0, resized: '' }); continue; }
      size--;
      const shouldShrink = shrink === 'half' ? cap > 1 && size <= cap / 2 : shrink === 'quarter' ? cap > 1 && size <= cap / 4 : false;
      if (shouldShrink) { copies = size; cap = Math.max(1, Math.floor(cap / 2)); resized = 'shrink'; }
    }
    out.push({ op, size, cap, copies, cost: 1 + copies, resized });
  }
  return out;
}

export const totalCost = (s: Step[]) => s.reduce((a, b) => a + b.cost, 0);

/** n pushes from empty: total cost. */
export const pushCost = (n: number, grow: Grow) => totalCost(simulate(Array(n).fill('push'), grow, 'none'));

// Greedy interval scheduling and interval partitioning (lesson 3.3), recorded frame by frame.
// Intervals are half-open [s, f): two intervals that only touch at an endpoint are compatible.

export interface Iv { s: number; f: number }
export type Rule = 'start' | 'short' | 'conflicts' | 'finish';

export const overlap = (a: Iv, b: Iv) => a.s < b.f && b.s < a.f;

export interface GFrame { chosen: number[]; rejected: number[]; cur: number; note: string; done?: boolean }

export const RULE_AR: Record<Rule, string> = {
  start: 'الأبكر بداية',
  short: 'الأقصر',
  conflicts: 'الأقل تعارضًا',
  finish: 'الأبكر نهاية',
};

export function* greedyFrames(I: Iv[], rule: Rule): Generator<GFrame> {
  const chosen: number[] = [], rejected: number[] = [];
  const alive = new Set(I.map((_, i) => i));
  const F = (cur: number, note: string, done = false): GFrame => ({ chosen: chosen.slice(), rejected: rejected.slice(), cur, note, done });
  const key = (i: number): number => {
    if (rule === 'start') return I[i].s;
    if (rule === 'finish') return I[i].f;
    if (rule === 'short') return I[i].f - I[i].s;
    let c = 0;
    for (const j of alive) if (j !== i && overlap(I[i], I[j])) c++;
    return c;
  };
  yield F(-1, `القاعدة: اختر ${RULE_AR[rule]} بين الفترات الباقية، ثم احذف كل ما يتعارض معها`);
  while (alive.size) {
    let pick = -1, kb = Infinity;
    for (const i of alive) { const k = key(i); if (k < kb || (k === kb && I[i].f < I[pick].f)) { kb = k; pick = i; } }
    chosen.push(pick);
    alive.delete(pick);
    const killed: number[] = [];
    for (const j of [...alive]) if (overlap(I[pick], I[j])) { alive.delete(j); killed.push(j); rejected.push(j); }
    yield F(pick, `اخترنا [${I[pick].s}, ${I[pick].f})${rule === 'conflicts' ? ` (${kb} ${kb === 1 ? 'تعارض' : 'تعارضات'})` : ''}، وحذفنا ${killed.length} ${killed.length === 1 ? 'فترة تتعارض' : 'فترات تتعارض'} معها`);
  }
  yield F(-1, `انتهى: ${chosen.length} ${chosen.length <= 10 && chosen.length >= 3 ? 'فترات' : 'فترة'}`, true);
}

/** The optimum (earliest-finish greedy, proved optimal in the lesson). */
export function optimum(I: Iv[]): number {
  const S = I.slice().sort((a, b) => a.f - b.f);
  let c = 0, end = -Infinity;
  for (const x of S) if (x.s >= end) { c++; end = x.f; }
  return c;
}

/** Brute force over all subsets, for tests. */
export function bruteOptimum(I: Iv[]): number {
  let best = 0;
  for (let m = 0; m < 1 << I.length; m++) {
    const S = I.filter((_, i) => m >> i & 1);
    if (S.every((a, i) => S.every((b, j) => i === j || !overlap(a, b)))) best = Math.max(best, S.length);
  }
  return best;
}

export interface PFrame { room: number[]; cur: number; free: number[]; rooms: number; note: string; done?: boolean }

export function depth(I: Iv[]): number {
  const ev: [number, number][] = [];
  for (const x of I) { ev.push([x.s, 1]); ev.push([x.f, -1]); }
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);   // ends before starts at the same time
  let c = 0, m = 0;
  for (const [, d] of ev) { c += d; m = Math.max(m, c); }
  return m;
}

/** Sort by start; put each interval in any room that is free, else open a new room. */
export function* partitionFrames(I: Iv[]): Generator<PFrame> {
  const order = I.map((_, i) => i).sort((a, b) => I[a].s - I[b].s);
  const room = I.map(() => -1);
  const endOf: number[] = [];
  yield { room: room.slice(), cur: -1, free: [], rooms: 0, note: 'نرتب الفترات حسب البداية، ونضع كل فترة في أي قاعة فارغة', };
  for (const i of order) {
    const free = endOf.map((e, r) => (e <= I[i].s ? r : -1)).filter((r) => r >= 0);
    let r: number;
    if (free.length) { r = free[0]; }
    else { r = endOf.length; endOf.push(0); }
    endOf[r] = I[i].f;
    room[i] = r;
    yield { room: room.slice(), cur: i, free, rooms: endOf.length, note: free.length ? `[${I[i].s}, ${I[i].f}) إلى القاعة ${r + 1}، وهي فارغة منذ ${I[i].s} أو قبل` : `كل القاعات مشغولة عند ${I[i].s}: نفتح القاعة ${r + 1}` };
  }
  yield { room: room.slice(), cur: -1, free: [], rooms: endOf.length, note: `انتهى: ${endOf.length} قاعات، وهذا يساوي أكبر عدد من الفترات المتداخلة في لحظة واحدة (${depth(I)})`, done: true };
}

export const PRESETS: Record<string, { label: string; I: Iv[] }> = {
  start: { label: 'تُفشل «الأبكر بداية»', I: [{ s: 0, f: 20 }, { s: 1, f: 4 }, { s: 5, f: 8 }, { s: 9, f: 12 }, { s: 13, f: 16 }, { s: 17, f: 19 }] },
  short: { label: 'تُفشل «الأقصر»', I: [{ s: 0, f: 10 }, { s: 10, f: 20 }, { s: 8, f: 12 }, { s: 20, f: 30 }, { s: 30, f: 39 }, { s: 27, f: 32 }] },
  conflicts: {
    label: 'تُفشل «الأقل تعارضًا»',
    I: [
      { s: 0, f: 4 }, { s: 5, f: 9 }, { s: 10, f: 14 }, { s: 15, f: 19 },
      { s: 3, f: 6 }, { s: 3, f: 6 }, { s: 3, f: 6 },
      { s: 8, f: 11 },
      { s: 13, f: 16 }, { s: 13, f: 16 }, { s: 13, f: 16 },
    ],
  },
};

// Closest pair of points by divide and conquer (lesson 3.2), recorded frame by frame.

export type P2 = [number, number];
export const d2 = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export interface CPFrame {
  lo: number; hi: number;          // current index range in x-sorted order [lo, hi)
  midX: number | null;
  delta: number;                   // best distance known inside this call (Infinity if none yet)
  strip: number[];                 // indices (x-sorted) in the strip
  pair: [number, number] | null;   // pair being compared now
  best: [number, number] | null;   // best pair overall so far
  bestD: number;
  comps: number;
  depth: number;
  note: string;
  done?: boolean;
}

export function* cpFrames(P0: P2[]): Generator<CPFrame> {
  const P = P0.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let best: [number, number] | null = null, bestD = Infinity, comps = 0;
  const F = (o: Partial<CPFrame> & Pick<CPFrame, 'lo' | 'hi' | 'note' | 'depth'>): CPFrame => ({
    midX: null, delta: Infinity, strip: [], pair: null, best, bestD, comps, ...o,
  });
  const look = (i: number, j: number) => {
    comps++;
    const d = d2(P[i], P[j]);
    if (d < bestD) { bestD = d; best = [i, j]; }
    return d;
  };

  function* rec(lo: number, hi: number, depth: number): Generator<CPFrame, number> {
    if (hi - lo <= 3) {
      let d = Infinity;
      for (let i = lo; i < hi; i++) for (let j = i + 1; j < hi; j++) {
        d = Math.min(d, look(i, j));
        yield F({ lo, hi, depth, pair: [i, j], delta: d, note: `جزء صغير (${hi - lo} نقاط): نقارن كل زوج` });
      }
      return d;
    }
    const mid = (lo + hi) >> 1;
    const midX = (P[mid - 1][0] + P[mid][0]) / 2;
    yield F({ lo, hi, depth, midX, note: `نقسم ${hi - lo} نقطة بخط عمودي: ${mid - lo} يسارًا و${hi - mid} يمينًا` });
    const dl = yield* rec(lo, mid, depth + 1);
    const dr = yield* rec(mid, hi, depth + 1);
    const delta = Math.min(dl, dr);
    const strip: number[] = [];
    for (let i = lo; i < hi; i++) if (Math.abs(P[i][0] - midX) < delta) strip.push(i);
    strip.sort((a, b) => P[a][1] - P[b][1]);
    yield F({ lo, hi, depth, midX, delta, strip, note: `δ = ${delta.toFixed(1)}. الشريط بعرض δ على جانبي الخط فيه ${strip.length} من ${hi - lo} نقطة` });
    let d = delta;
    for (let a = 0; a < strip.length; a++)
      for (let b = a + 1; b < strip.length && P[strip[b]][1] - P[strip[a]][1] < d; b++) {
        const dd = look(strip[a], strip[b]);
        const better = dd < d;
        d = Math.min(d, dd);
        yield F({ lo, hi, depth, midX, delta: d, strip, pair: [strip[a], strip[b]], note: better ? `زوج عبر الخط أقرب: ${dd.toFixed(1)}` : `نقارن مع النقاط التي فرق ارتفاعها أقل من δ فقط` });
      }
    return d;
  }

  yield F({ lo: 0, hi: P.length, depth: 0, note: `${P.length} نقطة مرتبة حسب x. القوة الغاشمة تحتاج إلى ${(P.length * (P.length - 1)) / 2} مقارنة` });
  const d = yield* rec(0, P.length, 0);
  yield F({ lo: 0, hi: P.length, depth: 0, delta: d, note: `أقرب زوج على بعد ${d.toFixed(2)}، بـ ${comps} حساب مسافة بدل ${(P.length * (P.length - 1)) / 2}`, done: true });
}

export function sortedPoints(P0: P2[]): P2[] { return P0.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); }

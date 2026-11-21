// Karatsuba multiplication (lesson 3.2), recorded as a growing tree of recursive calls.

export interface KCall {
  id: number;
  parent: number;
  depth: number;
  x: bigint;
  y: bigint;
  m: number;            // split position (digits); 0 for a base case
  role: string;         // 'z2' | 'z1' | 'z0' | 'root'
  result: bigint | null;
}

export interface KFrame { calls: KCall[]; cur: number; note: string; mults: number; done?: boolean }

const digits = (v: bigint) => (v < 0n ? -v : v).toString().length;

export function* karaFrames(x0: bigint, y0: bigint): Generator<KFrame> {
  const calls: KCall[] = [];
  let mults = 0;
  const snap = (cur: number, note: string, done = false): KFrame => ({ calls: calls.map((c) => ({ ...c })), cur, note, mults, done });

  function* rec(x: bigint, y: bigint, parent: number, depth: number, role: string): Generator<KFrame, bigint> {
    const id = calls.length;
    calls.push({ id, parent, depth, x, y, m: 0, role, result: null });
    const c = calls[id];
    if (x === 0n || y === 0n) {
      c.result = 0n;
      yield snap(id, `أحد العددين صفر: الناتج 0 دون ضرب`);
      return 0n;
    }
    const n = Math.max(digits(x), digits(y));
    if (n === 1) {
      mults++;
      c.result = x * y;
      yield snap(id, `ضرب رقمين: ${x} × ${y} = ${x * y}. هذا ضرب أساسي رقم ${mults}`);
      return c.result;
    }
    const m = Math.floor(n / 2);
    c.m = m;
    const B = 10n ** BigInt(m);
    const x1 = x / B, xl = x % B, y1 = y / B, yl = y % B;
    yield snap(id, `نقسم عند ${m} ${m === 1 ? 'خانة' : 'خانات'}: ${x} = ${x1}·10^${m} + ${xl}، و${y} = ${y1}·10^${m} + ${yl}`);
    const z2 = yield* rec(x1, y1, id, depth + 1, 'z2');
    const z0 = yield* rec(xl, yl, id, depth + 1, 'z0');
    const s = yield* rec(x1 + xl, y1 + yl, id, depth + 1, 'z1');
    const z1 = s - z2 - z0;
    c.result = z2 * B * B + z1 * B + z0;
    yield snap(id, `z1 = ${s} − ${z2} − ${z0} = ${z1}. الناتج = ${z2}·10^${2 * m} + ${z1}·10^${m} + ${z0} = ${c.result}`);
    return c.result;
  }

  const r = yield* rec(x0, y0, -1, 0, 'root');
  yield snap(0, `انتهى: ${x0} × ${y0} = ${r}، بـ ${mults} ضربًا أساسيًا`, true);
}

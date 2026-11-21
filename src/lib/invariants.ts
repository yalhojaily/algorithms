// Loop-invariant programs for lesson 1.2. Each program yields frames; frames marked `check`
// are the loop-head tests, where a loop invariant must hold. Each program comes with candidate
// invariants: some true and strong enough, some true but too weak, some false.

import { mulberry32 } from './montecarlo';

export interface InvState {
  arr: number[];
  vars: Record<string, number>;
}

export interface InvFrame extends InvState {
  line: number;
  /** The loop test is evaluated here: the invariant must hold in this state. */
  check: boolean;
  /** Completed loop iterations so far. */
  iter: number;
  /** Highlighted slice [from, to] inclusive (the part the invariant talks about). */
  range?: [number, number];
  /** Cells to outline as pointers. */
  ptr?: number[];
  done?: string;
}

export interface Candidate {
  id: string;
  tex: string;
  /** On the default input (seed 7): does it hold at every check? */
  holds: boolean;
  /** Together with the exit condition, does it give the postcondition? */
  strong: boolean;
  check: (s: InvState, inp: InvState) => boolean;
  note: string;
}

export interface InvProgram {
  key: string;
  label: string;
  pseudo: string[];
  post: string;
  make: (seed: number) => InvState;
  run: (inp: InvState) => Generator<InvFrame>;
  candidates: Candidate[];
}

export const sumOf = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const isSorted = (a: number[]) => a.every((v, k) => k === 0 || a[k - 1] <= v);
export const sameMultiset = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort((x, y) => x - y).every((v, k) => v === [...b].sort((x, y) => x - y)[k]);
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

function shuffled(pool: number[], rand: () => number) {
  const p = [...pool];
  for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  return p;
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);

export const INV_PROGRAMS: InvProgram[] = [
  {
    key: 'sum', label: 'المجموع',
    pseudo: ['SUM(A, n):', '  s ← 0', '  i ← 0', '  while i < n:', '    s ← s + A[i]', '    i ← i + 1', '  return s'],
    post: 's = A[0] + A[1] + ⋯ + A[n−1]',
    make(seed) {
      const r = mulberry32(seed);
      const arr = Array.from({ length: 7 }, () => Math.floor(r() * 15) - 5);
      arr[0] = -3;
      return { arr, vars: {} };
    },
    *run(inp): Generator<InvFrame> {
      const A = inp.arr, n = A.length;
      let s = 0, i = 0;
      const f = (line: number, check = false, extra: Partial<InvFrame> = {}): InvFrame =>
        ({ arr: A, vars: { s, i, n }, line, check, iter: i, range: i > 0 ? [0, i - 1] : undefined, ptr: i < n ? [i] : [], ...extra });
      yield f(2); yield f(3);
      for (;;) {
        yield f(4, true);
        if (!(i < n)) break;
        s += A[i]; yield f(5);
        i++; yield f(6);
      }
      yield f(7, false, { done: `s = ${s}` });
    },
    candidates: [
      { id: 'a', tex: '$s = A[0] + \\cdots + A[i-1]$', holds: true, strong: true,
        check: (st, inp) => st.vars.s === sumOf(inp.arr.slice(0, st.vars.i)),
        note: 'عند الخروج $i = n$، فيصبح الثابت هو المطلوب نفسه: $s$ مجموع العناصر كلها.' },
      { id: 'b', tex: '$s \\ge 0$', holds: false, strong: false,
        check: (st) => st.vars.s >= 0,
        note: 'يصح عند التهيئة ($s = 0$)، لكن الحفاظ عليه يحتاج إلى أن تكون العناصر غير سالبة، وهذا ليس من شروط المسألة. أول عنصر هنا سالب.' },
      { id: 'c', tex: '$0 \\le i \\le n$', holds: true, strong: false,
        check: (st) => st.vars.i >= 0 && st.vars.i <= st.vars.n,
        note: 'صحيح دائمًا، ومفيد لإثبات أن الفهرسة لا تخرج عن المصفوفة، لكنه لا يقول شيئًا عن $s$، فلا يثبت المطلوب.' },
      { id: 'd', tex: '$s = A[0] + \\cdots + A[i]$', holds: false, strong: false,
        check: (st, inp) => st.vars.s === sumOf(inp.arr.slice(0, st.vars.i + 1)),
        note: 'خطأ «بمقدار واحد» (off-by-one): عند التهيئة $s = 0$، لكن الطرف الأيمن $A[0]$. فهو يسقط قبل أن تبدأ الحلقة.' },
    ],
  },
  {
    key: 'max', label: 'الأكبر',
    pseudo: ['MAX(A, n):', '  m ← A[0]', '  i ← 1', '  while i < n:', '    if A[i] > m: m ← A[i]', '    i ← i + 1', '  return m'],
    post: 'm = max(A[0], …, A[n−1])',
    make(seed) {
      const r = mulberry32(seed);
      const arr = Array.from({ length: 7 }, () => 1 + Math.floor(r() * 20));
      arr[1] = Math.max(...arr) + 3;
      arr[2] = Math.max(1, arr[1] - 8);
      return { arr, vars: {} };
    },
    *run(inp): Generator<InvFrame> {
      const A = inp.arr, n = A.length;
      let m = A[0], i = 0;
      const f = (line: number, check = false, extra: Partial<InvFrame> = {}): InvFrame =>
        ({ arr: A, vars: i === 0 ? { m, n } : { m, i, n }, line, check, iter: Math.max(0, i - 1), range: i > 0 ? [0, i - 1] : [0, 0], ptr: i > 0 && i < n ? [i] : [], ...extra });
      yield f(2);
      i = 1; yield f(3);
      for (;;) {
        yield f(4, true);
        if (!(i < n)) break;
        if (A[i] > m) m = A[i];
        yield f(5);
        i++; yield f(6);
      }
      yield f(7, false, { done: `m = ${m}` });
    },
    candidates: [
      { id: 'a', tex: '$m = \\max(A[0], \\ldots, A[i-1])$', holds: true, strong: true,
        check: (st, inp) => st.vars.m === Math.max(...inp.arr.slice(0, st.vars.i)),
        note: 'عند الخروج $i = n$، فـ $m$ أكبر عناصر المصفوفة كلها.' },
      { id: 'b', tex: '$m \\ge A[0]$', holds: true, strong: false,
        check: (st, inp) => st.vars.m >= inp.arr[0],
        note: 'صحيح دائمًا، لكنه ضعيف: القيمة $m = 10^9$ تحققه أيضًا. لا يربط $m$ بالعناصر التي فُحصت.' },
      { id: 'c', tex: '$m = A[i-1]$', holds: false, strong: false,
        check: (st, inp) => st.vars.m === inp.arr[st.vars.i - 1],
        note: 'يصح ما دامت العناصر تتزايد، ويسقط عند أول عنصر أصغر من الأكبر حتى الآن.' },
      { id: 'd', tex: '$m$ أحد عناصر $A$', holds: true, strong: false,
        check: (st, inp) => inp.arr.includes(st.vars.m),
        note: 'صحيح، ونصف المطلوب. لكنه وحده لا يثبت أن $m$ هو **الأكبر**: $A[0]$ يحققه أيضًا.' },
    ],
  },
  {
    key: 'ins', label: 'الترتيب بالإدراج',
    pseudo: ['INSERTION-SORT(A, n):', '  i ← 1', '  while i < n:', '    key ← A[i];  j ← i − 1', '    while j ≥ 0 and A[j] > key:', '      A[j+1] ← A[j];  j ← j − 1', '    A[j+1] ← key', '    i ← i + 1'],
    post: 'A مرتبة، وعناصرها هي عناصر المدخل نفسها',
    make(seed) {
      const r = mulberry32(seed);
      const arr = shuffled(range(1, 30), r).slice(0, 6);
      const k = arr.indexOf(Math.max(...arr));
      [arr[0], arr[k]] = [arr[k], arr[0]];
      return { arr, vars: {} };
    },
    *run(inp): Generator<InvFrame> {
      const A = [...inp.arr], n = A.length;
      let i = 1, j = 0, key = 0, it = 0;
      const f = (line: number, check = false, extra: Partial<InvFrame> = {}): InvFrame =>
        ({ arr: [...A], vars: line <= 3 || line === 8 ? { i, n } : { i, j, key }, line, check, iter: it, range: [0, i - 1], ptr: line >= 4 && line <= 7 ? [j + 1] : [], ...extra });
      yield f(2);
      for (;;) {
        yield f(3, true);
        if (!(i < n)) break;
        key = A[i]; j = i - 1; yield f(4);
        for (;;) {
          yield f(5);
          if (!(j >= 0 && A[j] > key)) break;
          A[j + 1] = A[j]; j--; yield f(6);
        }
        A[j + 1] = key; yield f(7);
        i++; it++; yield f(8);
      }
      yield f(3, false, { done: 'A مرتبة' });
    },
    candidates: [
      { id: 'a', tex: '$A[0..i-1]$ مرتبة، وفيها عناصر $A[0..i-1]$ الأصلية نفسها، والباقي $A[i..n-1]$ لم يتغير', holds: true, strong: true,
        check: (st, inp) => {
          const i = st.vars.i;
          return isSorted(st.arr.slice(0, i)) && sameMultiset(st.arr.slice(0, i), inp.arr.slice(0, i)) && st.arr.slice(i).every((v, k) => v === inp.arr[i + k]);
        },
        note: 'عند الخروج $i = n$: المصفوفة كلها مرتبة، وعناصرها هي الأصلية. وهذا هو المطلوب بشرطيه.' },
      { id: 'b', tex: '$A[0..i-1]$ فيها أصغر $i$ عناصر في $A$', holds: false, strong: false,
        check: (st, inp) => {
          const i = st.vars.i, smallest = [...inp.arr].sort((x, y) => x - y).slice(0, i);
          return sameMultiset(st.arr.slice(0, i), smallest);
        },
        note: 'هذا ثابت **الترتيب بالاختيار** (selection sort)، لا الإدراج. الإدراج لا ينظر إلى ما بعد $i$، فقد يكون الأكبر في البداية. ستبرهن ثابت الاختيار في التمرين 2.' },
      { id: 'c', tex: '$A[0..i-1]$ مرتبة', holds: true, strong: false,
        check: (st) => isSorted(st.arr.slice(0, st.vars.i)),
        note: 'صحيح، ويعطي عند الخروج أن $A$ مرتبة. لكنه لا يضمن أن العناصر هي الأصلية: مصفوفة أصفار مرتبة أيضًا. والمواصفة لها شرطان (الدرس 1.1).' },
      { id: 'd', tex: '$A[i-1] \\le A[i]$', holds: false, strong: false,
        check: (st) => st.vars.i >= st.vars.n || st.arr[st.vars.i - 1] <= st.arr[st.vars.i],
        note: 'يتكلم عن $A[i]$ الذي لم تصل إليه الحلقة بعد، فلا شيء في الخوارزمية يضمنه.' },
    ],
  },
  {
    key: 'bs', label: 'البحث الثنائي',
    pseudo: ['BINARY-SEARCH(A, n, x):    // A sorted', '  lo ← 0;  hi ← n − 1', '  while lo ≤ hi:', '    mid ← ⌊(lo + hi) / 2⌋', '    if A[mid] = x: return mid', '    if A[mid] < x: lo ← mid + 1', '    else: hi ← mid − 1', '  return NOT-FOUND'],
    post: 'الموضع المعاد فيه x، أو NOT-FOUND وx ليس في A',
    make(seed) {
      const r = mulberry32(seed);
      const arr = shuffled(range(1, 20), r).slice(0, 10).map((v) => 2 * v).sort((a, b) => a - b);
      // Odd seeds: x is absent (an odd number strictly inside the range). Even seeds: x is present.
      const x = seed % 2 === 0 ? arr[Math.floor(r() * arr.length)] : arr[2 + Math.floor(r() * 6)] + 1;
      return { arr, vars: { x } };
    },
    *run(inp): Generator<InvFrame> {
      const A = inp.arr, n = A.length, x = inp.vars.x;
      let lo = 0, hi = n - 1, mid = -1, it = 0;
      const f = (line: number, check = false, extra: Partial<InvFrame> = {}): InvFrame =>
        ({ arr: A, vars: mid < 0 ? { x, lo, hi } : { x, lo, hi, mid }, line, check, iter: it, range: lo <= hi ? [lo, hi] : undefined, ptr: mid >= 0 && line >= 4 ? [mid] : [], ...extra });
      yield f(2);
      for (;;) {
        yield f(3, true);
        if (!(lo <= hi)) break;
        mid = Math.floor((lo + hi) / 2); yield f(4);
        if (A[mid] === x) { yield f(5, false, { done: `return ${mid}` }); return; }
        yield f(5);
        if (A[mid] < x) { lo = mid + 1; it++; yield f(6); } else { hi = mid - 1; it++; yield f(7); }
      }
      yield f(8, false, { done: 'NOT-FOUND' });
    },
    candidates: [
      { id: 'a', tex: 'إذا كان $x$ في $A$ فهو في $A[lo..hi]$', holds: true, strong: true,
        check: (st, inp) => !inp.arr.includes(st.vars.x) || st.arr.slice(st.vars.lo, st.vars.hi + 1).includes(st.vars.x),
        note: 'عند الخروج $lo > hi$، فالجزء $A[lo..hi]$ خالٍ، فـ $x$ ليس في $A$، وNOT-FOUND صحيح. وإذا أعادت الخوارزمية mid فقد تحققت أن $A[mid] = x$.' },
      { id: 'b', tex: '$lo \\le hi$', holds: false, strong: false,
        check: (st) => st.vars.lo <= st.vars.hi,
        note: 'هذا شرط الحلقة نفسه، لا ثابتها: يسقط في الفحص الأخير حين لا يكون $x$ موجودًا، وهذا بالضبط سبب خروج الحلقة.' },
      { id: 'c', tex: '$A[lo] \\le x \\le A[hi]$', holds: false, strong: false,
        check: (st) => st.arr[st.vars.lo] !== undefined && st.arr[st.vars.hi] !== undefined && st.arr[st.vars.lo] <= st.vars.x && st.vars.x <= st.arr[st.vars.hi],
        note: 'يشبه الثابت الصحيح، لكنه يسقط إذا لم يكن $x$ في $A$: عند الخروج $hi = lo - 1$ و$A[hi] < x < A[lo]$. ولا يصح عند البداية إذا كان $x$ خارج مدى المصفوفة.' },
      { id: 'd', tex: '$0 \\le lo$ و$hi \\le n - 1$', holds: true, strong: false,
        check: (st) => st.vars.lo >= 0 && st.vars.hi <= st.arr.length - 1,
        note: 'صحيح، ويضمن مع $lo \\le hi$ أن $A[mid]$ داخل المصفوفة. لكنه لا يقول شيئًا عن مكان $x$.' },
    ],
  },
  {
    key: 'gcd', label: 'خوارزمية إقليدس',
    pseudo: ['EUCLID(a, b):      // a, b ≥ 0, not both 0', '  while b ≠ 0:', '    (a, b) ← (b, a mod b)', '  return a'],
    post: 'a = gcd(a₀, b₀)',
    make(seed) {
      const r = mulberry32(seed);
      const g = 2 + Math.floor(r() * 7);
      let p = 2 + Math.floor(r() * 9), q = 2 + Math.floor(r() * 9);
      while (q === p || gcd(p, q) !== 1) q = 2 + Math.floor(r() * 11);
      if (p > q) [p, q] = [q, p];
      return { arr: [], vars: { a: g * p, b: g * q } };
    },
    *run(inp): Generator<InvFrame> {
      let a = inp.vars.a, b = inp.vars.b, it = 0;
      const f = (line: number, check = false, extra: Partial<InvFrame> = {}): InvFrame => ({ arr: [], vars: { a, b }, line, check, iter: it, ...extra });
      for (;;) {
        yield f(2, true);
        if (b === 0) break;
        [a, b] = [b, a % b]; it++; yield f(3);
      }
      yield f(4, false, { done: `gcd = ${a}` });
    },
    candidates: [
      { id: 'a', tex: '$\\gcd(a, b) = \\gcd(a_0, b_0)$', holds: true, strong: true,
        check: (st, inp) => gcd(st.vars.a, st.vars.b) === gcd(inp.vars.a, inp.vars.b),
        note: 'الحفاظ عليه هو مبرهنة $\\gcd(a, b) = \\gcd(b, a \\bmod b)$. وعند الخروج $b = 0$، و$\\gcd(a, 0) = a$.' },
      { id: 'b', tex: '$a \\ge b$', holds: false, strong: false,
        check: (st) => st.vars.a >= st.vars.b,
        note: 'يسقط عند التهيئة فقط، إذا بدأنا بـ $a < b$. بعد أول دورة يصبح صحيحًا دائمًا لأن $a \\bmod b < b$. والثابت يجب أن يصح **قبل** الدورة الأولى أيضًا.' },
      { id: 'c', tex: '$a \\ge 0$ و$b \\ge 0$', holds: true, strong: false,
        check: (st) => st.vars.a >= 0 && st.vars.b >= 0,
        note: 'صحيح، ويُحتاج إليه لإثبات التوقف ($b$ عدد طبيعي يتناقص)، لكنه لا يربط $a$ بالقاسم المشترك الأكبر.' },
      { id: 'd', tex: '$b$ يقسم $a$', holds: false, strong: false,
        check: (st) => st.vars.b !== 0 && st.vars.a % st.vars.b === 0,
        note: 'لو صح لانتهت الخوارزمية بعد دورة واحدة. لا شيء يضمنه.' },
    ],
  },
  {
    key: 'peasant', label: 'ضرب الفلاحين',
    pseudo: ['PEASANT(x, y):        // x, y ≥ 0', '  prod ← 0;  k ← 0', '  while x > 0:', '    if x is odd: prod ← prod + y', '    x ← ⌊x / 2⌋;  y ← y + y', '    k ← k + 1', '  return prod'],
    post: 'prod = x₀ · y₀',
    make(seed) {
      const r = mulberry32(seed);
      return { arr: [], vars: { x: 5 + Math.floor(r() * 56), y: 3 + Math.floor(r() * 38) } };
    },
    *run(inp): Generator<InvFrame> {
      let x = inp.vars.x, y = inp.vars.y, prod = 0, k = 0;
      const f = (line: number, check = false, extra: Partial<InvFrame> = {}): InvFrame => ({ arr: [], vars: { x, y, prod, k }, line, check, iter: k, ...extra });
      yield f(2);
      for (;;) {
        yield f(3, true);
        if (!(x > 0)) break;
        if (x % 2 === 1) prod += y;
        yield f(4);
        x = Math.floor(x / 2); y = y + y; yield f(5);
        k++; yield f(6);
      }
      yield f(7, false, { done: `prod = ${prod}` });
    },
    candidates: [
      { id: 'a', tex: '$\\text{prod} + x \\cdot y = x_0 \\cdot y_0$', holds: true, strong: true,
        check: (st, inp) => st.vars.prod + st.vars.x * st.vars.y === inp.vars.x * inp.vars.y,
        note: 'عند الخروج $x = 0$، فـ $\\text{prod} = x_0 y_0$. وقد برهنته في التمرين 5 من الدرس 1.1.' },
      { id: 'b', tex: '$\\text{prod} \\le x_0 \\cdot y_0$', holds: true, strong: false,
        check: (st, inp) => st.vars.prod <= inp.vars.x * inp.vars.y,
        note: 'صحيح (لأن $xy \\ge 0$ في الثابت الأول)، لكنه لا يحدد قيمة prod عند الخروج.' },
      { id: 'c', tex: '$x$ فردي', holds: false, strong: false,
        check: (st) => st.vars.x % 2 === 1,
        note: 'ليس حقيقة ثابتة عن الحلقة: $x$ يتغير، و$x = 0$ عند الخروج زوجي.' },
      { id: 'd', tex: '$y = y_0 \\cdot 2^k$', holds: true, strong: false,
        check: (st, inp) => st.vars.y === inp.vars.y * 2 ** st.vars.k,
        note: 'صحيح، ويصف $y$ بدقة، لكنه لا يقول شيئًا عن prod.' },
    ],
  },
];

/** Evaluate a candidate at every check frame. Returns the list of results in order. */
export function evaluate(p: InvProgram, c: Candidate, seed: number): boolean[] {
  const inp = p.make(seed);
  const out: boolean[] = [];
  for (const f of p.run(inp)) if (f.check) out.push(c.check(f, inp));
  return out;
}

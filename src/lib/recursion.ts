// Call traces for lesson 1.6: every call and return, so a page can replay the call stack
// and grow the call tree one event at a time.

export interface CallNode {
  id: number;
  parent: number | null;
  label: string;
  depth: number;
  value?: string;
  /** Layout position, filled in by layout(). */
  x: number;
}

export type TraceEvent = { type: 'call'; id: number } | { type: 'return'; id: number };

export interface Trace {
  nodes: CallNode[];
  events: TraceEvent[];
  result: string;
}

/** Records a recursive computation. `rec(label, body)` wraps one call. */
export function trace<T>(run: (rec: <R>(label: string, body: () => R, show?: (r: R) => string) => R) => T, show: (r: T) => string = String): Trace {
  const nodes: CallNode[] = [], events: TraceEvent[] = [], stack: number[] = [];
  const rec = <R,>(label: string, body: () => R, sh: (r: R) => string = String): R => {
    const id = nodes.length;
    nodes.push({ id, parent: stack.length ? stack[stack.length - 1] : null, label, depth: stack.length, x: 0 });
    events.push({ type: 'call', id });
    stack.push(id);
    const r = body();
    stack.pop();
    nodes[id].value = sh(r);
    events.push({ type: 'return', id });
    return r;
  };
  const result = run(rec);
  layout(nodes);
  return { nodes, events, result: show(result) };
}

/** Leaves get consecutive x positions in call order; a parent sits over the middle of its children. */
function layout(nodes: CallNode[]) {
  const kids = new Map<number, number[]>();
  for (const n of nodes) if (n.parent !== null) kids.set(n.parent, [...(kids.get(n.parent) ?? []), n.id]);
  let next = 0;
  const place = (id: number): number => {
    const ch = kids.get(id) ?? [];
    if (!ch.length) { nodes[id].x = next++; return nodes[id].x; }
    const xs = ch.map(place);
    nodes[id].x = (xs[0] + xs[xs.length - 1]) / 2;
    return nodes[id].x;
  };
  if (nodes.length) place(0);
}

export interface RecProgram {
  key: string;
  label: string;
  param: string;
  min: number;
  max: number;
  start: number;
  pseudo: string[];
  run: (n: number) => Trace;
}

export const REC_PROGRAMS: RecProgram[] = [
  {
    key: 'fact', label: 'المضروب', param: 'n', min: 0, max: 8, start: 4,
    pseudo: ['FACT(n):', '  if n = 0: return 1', '  return n · FACT(n − 1)'],
    run: (n) => trace((rec) => {
      const f = (k: number): number => rec(`fact(${k})`, () => (k === 0 ? 1 : k * f(k - 1)));
      return f(n);
    }),
  },
  {
    key: 'pow', label: 'الأس السريع', param: 'n', min: 0, max: 64, start: 13,
    pseudo: ['POW(x, n):', '  if n = 0: return 1', '  h ← POW(x, ⌊n/2⌋)', '  if n is even: return h · h', '  else: return h · h · x'],
    run: (n) => trace((rec) => {
      const p = (k: number): bigint => rec(`pow(2, ${k})`, () => {
        if (k === 0) return 1n;
        const h = p(Math.floor(k / 2));
        return k % 2 === 0 ? h * h : h * h * 2n;
      }, (v) => (v < 10n ** 7n ? String(v) : `2^${k}`));
      return p(n);
    }, (v) => String(v)),
  },
  {
    key: 'peasant', label: 'ضرب الفلاح', param: 'x', min: 0, max: 60, start: 13,
    pseudo: ['PeasantMultiply(x, y):', '  if x = 0: return 0', '  prod ← PeasantMultiply(⌊x/2⌋, y + y)', '  if x is odd: prod ← prod + y', '  return prod'],
    run: (x) => trace((rec) => {
      const f = (a: number, b: number): number => rec(`PM(${a}, ${b})`, () => {
        if (a === 0) return 0;
        const p = f(Math.floor(a / 2), b + b);
        return a % 2 ? p + b : p;
      });
      return f(x, 7);
    }),
  },
  {
    key: 'fib', label: 'فيبوناتشي (الساذج)', param: 'n', min: 0, max: 8, start: 5,
    pseudo: ['FIB(n):', '  if n < 2: return n', '  return FIB(n − 1) + FIB(n − 2)'],
    run: (n) => trace((rec) => {
      const f = (k: number): number => rec(`fib(${k})`, () => (k < 2 ? k : f(k - 1) + f(k - 2)));
      return f(n);
    }),
  },
  {
    key: 'hanoi', label: 'أبراج هانوي', param: 'n', min: 0, max: 4, start: 3,
    pseudo: ['HANOI(n, from, to, via):', '  if n = 0: return', '  HANOI(n − 1, from, via, to)', '  move disk n: from → to', '  HANOI(n − 1, via, to, from)'],
    run: (n) => trace((rec) => {
      let moves = 0;
      const h = (k: number, a: string, b: string, c: string): number => rec(`H(${k}, ${a}→${b})`, () => {
        if (k === 0) return 0;
        const m1 = h(k - 1, a, c, b);
        moves++;
        const m2 = h(k - 1, c, b, a);
        return m1 + 1 + m2;
      }, (m) => `${m} نقلة`);
      h(n, 'A', 'C', 'B');
      return moves;
    }, (m) => `${m} نقلة`),
  },
];

export interface RecFrame {
  /** Index of the last event applied. */
  step: number;
  stack: number[];
  /** Node ids that have been called so far. */
  seen: number;
  returned: Set<number>;
  active: number;
  event: TraceEvent;
}

export function replay(t: Trace): RecFrame[] {
  const frames: RecFrame[] = [];
  const stack: number[] = [], returned = new Set<number>();
  let seen = 0;
  t.events.forEach((e, step) => {
    if (e.type === 'call') { stack.push(e.id); seen = Math.max(seen, e.id + 1); }
    else { stack.pop(); returned.add(e.id); }
    frames.push({ step, stack: [...stack], seen, returned: new Set(returned), active: e.id, event: e });
  });
  return frames;
}

export const maxDepth = (t: Trace) => Math.max(...t.nodes.map((n) => n.depth)) + 1;

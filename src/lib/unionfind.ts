// Union-Find (disjoint sets) recorded frame by frame for lesson 2.15.

export interface UState { parent: number[]; rank: number[] }
export interface UFrame {
  st: UState;
  path: number[];      // nodes on the current find path
  hl: number[];        // roots or nodes to emphasise
  line: number;
  note: string;
  steps: number;       // parent-pointer hops so far in this operation
  done?: boolean;
  linked?: [number, number];   // child root → new parent root
}
export interface UOpts { byRank: boolean; compress: boolean }

export const UF_PSEUDO = [
  'FIND(x):',
  '  if parent[x] = x: return x',
  '  r ← FIND(parent[x])',
  '  parent[x] ← r            ▷ path compression',
  '  return r',
  'UNION(a, b):',
  '  ra ← FIND(a); rb ← FIND(b); if ra = rb: return',
  '  if rank[ra] < rank[rb]: swap ra, rb      ▷ union by rank',
  '  parent[rb] ← ra',
  '  if rank[ra] = rank[rb]: rank[ra] ← rank[ra] + 1',
];

export const init = (n: number): UState => ({ parent: Array.from({ length: n }, (_, i) => i), rank: Array(n).fill(0) });
const copy = (s: UState): UState => ({ parent: s.parent.slice(), rank: s.rank.slice() });

export function rootOf(s: UState, x: number): number { while (s.parent[x] !== x) x = s.parent[x]; return x; }
export function depth(s: UState, x: number): number { let d = 0; while (s.parent[x] !== x) { x = s.parent[x]; d++; } return d; }
export function maxDepth(s: UState): number { return Math.max(0, ...s.parent.map((_, i) => depth(s, i))); }

export function* ufFrames(s0: UState, op: 'find' | 'union', a: number, b: number, o: UOpts): Generator<UFrame> {
  const s = copy(s0);
  let steps = 0;
  const F = (x: Partial<UFrame> & Pick<UFrame, 'line' | 'note'>): UFrame => ({ st: copy(s), path: [], hl: [], steps, ...x });

  function* find(x: number): Generator<UFrame, number> {
    const path = [x];
    while (s.parent[path[path.length - 1]] !== path[path.length - 1]) {
      const cur = path[path.length - 1];
      yield F({ path: path.slice(), hl: [cur], line: 3, note: `parent[${cur}] = ${s.parent[cur]}: نصعد` });
      path.push(s.parent[cur]);
      steps++;
    }
    const r = path[path.length - 1];
    yield F({ path: path.slice(), hl: [r], line: 2, note: `${r} جذر: FIND(${x}) = ${r}، بعد ${path.length - 1} ${path.length - 1 === 1 ? 'خطوة' : 'خطوات'}` });
    if (o.compress && path.length > 2) {
      for (const v of path.slice(0, -2)) s.parent[v] = r;
      yield F({ path: path.slice(), hl: [r], line: 4, note: `ضغط المسار: ${path.slice(0, -2).join('، ')} ${path.length > 3 ? 'تشير' : 'يشير'} الآن إلى ${r} مباشرة` });
    }
    return r;
  }

  if (op === 'find') {
    yield F({ line: 1, note: `FIND(${a})` });
    const r = yield* find(a);
    yield F({ hl: [r], line: 5, note: `الجواب ${r}`, done: true });
    return;
  }
  yield F({ line: 6, note: `UNION(${a}, ${b})` });
  let ra = yield* find(a);
  let rb = yield* find(b);
  if (ra === rb) { yield F({ hl: [ra], line: 7, note: `${a} و${b} في المجموعة نفسها بالفعل`, done: true }); return; }
  if (o.byRank && s.rank[ra] < s.rank[rb]) [ra, rb] = [rb, ra];
  s.parent[rb] = ra;
  if (o.byRank && s.rank[ra] === s.rank[rb]) s.rank[ra]++;
  yield F({ hl: [ra, rb], linked: [rb, ra], line: 9, note: o.byRank ? `نعلّق الجذر ذا الرتبة الأقل (${rb}) تحت الآخر (${ra}). رتبة ${ra} الآن ${s.rank[ra]}` : `نعلّق ${rb} تحت ${ra}`, done: true });
}

/** Apply an operation without frames. */
export function apply(s0: UState, op: 'find' | 'union', a: number, b: number, o: UOpts): UState {
  let last: UFrame | null = null;
  for (const f of ufFrames(s0, op, a, b, o)) last = f;
  return last!.st;
}

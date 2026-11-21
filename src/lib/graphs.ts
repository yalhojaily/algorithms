// Small undirected (multi)graph toolkit for lesson 0.11. Vertices 0..n-1, edges as [u, v] pairs (repeats allowed).

export type Edge = [number, number];

export function degrees(n: number, E: Edge[]): number[] {
  const d = Array(n).fill(0);
  for (const [u, v] of E) { d[u]++; d[v]++; }
  return d;
}

/** Component id for each vertex (iterative, so no recursion-depth problems). */
export function componentIds(n: number, E: Edge[]): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of E) { adj[u].push(v); adj[v].push(u); }
  const comp = Array(n).fill(-1);
  let c = 0;
  for (let s = 0; s < n; s++) {
    if (comp[s] >= 0) continue;
    const stack = [s];
    comp[s] = c;
    while (stack.length) {
      const u = stack.pop()!;
      for (const w of adj[u]) if (comp[w] < 0) { comp[w] = c; stack.push(w); }
    }
    c++;
  }
  return comp;
}

export function isTree(n: number, E: Edge[]): boolean {
  if (n === 0) return false;
  return E.length === n - 1 && new Set(componentIds(n, E)).size === 1;
}

export type EulerKind = 'circuit' | 'path' | 'none';

export function eulerInfo(n: number, E: Edge[]): { kind: EulerKind; odd: number[]; reason: string } {
  const d = degrees(n, E);
  const odd = d.map((x, i) => (x % 2 ? i : -1)).filter((i) => i >= 0);
  if (E.length === 0) return { kind: 'none', odd, reason: 'لا توجد حواف.' };
  const comp = componentIds(n, E);
  const used = new Set(d.map((x, i) => (x > 0 ? comp[i] : -1)).filter((c) => c >= 0));
  if (used.size > 1) return { kind: 'none', odd, reason: 'الحواف ليست كلها في مكوّن مترابط واحد.' };
  if (odd.length === 0) return { kind: 'circuit', odd, reason: 'كل الدرجات زوجية، والحواف في مكوّن واحد: توجد دورة Euler.' };
  if (odd.length === 2) return { kind: 'path', odd, reason: `رأسان فقط درجتهما فردية (${odd.map((v) => v + 1).join(' و')}): يوجد مسار Euler يبدأ بأحدهما وينتهي بالآخر.` };
  return { kind: 'none', odd, reason: `${odd.length} رؤوس درجتها فردية. كل مرور برأس في وسط المسار يستهلك حافتين، فلا يُسمح إلا بطرفين فرديين على الأكثر.` };
}

/** 2-colouring by BFS; returns the colours, or an odd cycle's vertices if the graph is not bipartite. */
export function bipartite(n: number, E: Edge[]): { ok: true; color: number[] } | { ok: false; edge: Edge } {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of E) { adj[u].push(v); adj[v].push(u); }
  const color = Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    if (color[s] >= 0) continue;
    color[s] = 0;
    const q = [s];
    while (q.length) {
      const u = q.shift()!;
      for (const w of adj[u]) {
        if (color[w] < 0) { color[w] = 1 - color[u]; q.push(w); }
        else if (color[w] === color[u]) return { ok: false, edge: [u, w] };
      }
    }
  }
  return { ok: true, color };
}

export interface EulerFrame { line: number; stack: number[]; path: number[]; used: boolean[]; cur?: number; edge?: number; note: string }

export const HIERHOLZER_PSEUDO = [
  'EULER(G, start):          // start = an odd vertex, if any',
  '  stack ← [start]; path ← [ ]',
  '  while stack is not empty:',
  '    v ← top of stack',
  '    if v has an unused edge (v, w):',
  '      mark it used; push w',
  '    else: pop v; append v to path',
  '  return path            // an Euler walk',
];

export function* hierholzer(n: number, E: Edge[], start: number): Generator<EulerFrame> {
  const adj: [number, number][][] = Array.from({ length: n }, () => []);
  E.forEach(([u, v], i) => { adj[u].push([v, i]); adj[v].push([u, i]); });
  const used = Array(E.length).fill(false);
  const ptr = Array(n).fill(0);
  const stack = [start];
  const path: number[] = [];
  const snap = (f: Omit<EulerFrame, 'stack' | 'path' | 'used'>): EulerFrame => ({ ...f, stack: [...stack], path: [...path], used: [...used] });
  yield snap({ line: 2, cur: start, note: `نبدأ من الرأس ${start + 1}.` });
  while (stack.length) {
    const v = stack[stack.length - 1];
    while (ptr[v] < adj[v].length && used[adj[v][ptr[v]][1]]) ptr[v]++;
    if (ptr[v] < adj[v].length) {
      const [w, i] = adj[v][ptr[v]];
      used[i] = true;
      stack.push(w);
      yield snap({ line: 6, cur: w, edge: i, note: `نمشي على الحافة ${v + 1}–${w + 1}.` });
    } else {
      stack.pop();
      path.push(v);
      yield snap({ line: 7, cur: v, note: `الرأس ${v + 1} لم يبقَ له حواف: نضيفه إلى المسار ونرجع.` });
    }
  }
  yield snap({ line: 8, note: `المسار: ${path.map((x) => x + 1).join(' → ')}` });
}

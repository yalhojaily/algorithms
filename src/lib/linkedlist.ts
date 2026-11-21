// Pointer algorithms on singly linked lists, recorded frame by frame for lesson 2.3.
// Nodes are numbered; next[i] is the index of the node after i (or null). Node positions are fixed for drawing.

export interface LLNode { val: string; x: number; y: number; sentinel?: boolean }

export interface LLFrame {
  next: (number | null)[];
  ptrs: Record<string, number | null>;
  line: number;
  note: string;
  /** A node whose next pointer just changed. */
  changed?: number;
  /** Nodes to show as finished / removed. */
  gone?: number[];
  done?: boolean;
}

export interface LLProgram {
  key: string;
  label: string;
  nodes: LLNode[];
  pseudo: string[];
  run: () => Generator<LLFrame>;
}

const row = (vals: (string | number)[], y = 0, x0 = 0): LLNode[] => vals.map((v, i) => ({ val: String(v), x: x0 + i, y }));
const chain = (n: number, from = 0): (number | null)[] => Array.from({ length: n }, (_, i) => (i + 1 < n ? from + i + 1 : null));

export const LL_PROGRAMS: LLProgram[] = [
  {
    key: 'rev', label: 'العكس',
    nodes: row([3, 7, 1, 9, 4, 6]),
    pseudo: ['REVERSE(head):', '  prev ← null;  cur ← head', '  while cur ≠ null:', '    nxt ← cur.next', '    cur.next ← prev', '    prev ← cur;  cur ← nxt', '  return prev   // the new head'],
    *run() {
      const next = chain(6);
      let prev: number | null = null, cur: number | null = 0, nxt: number | null = null;
      const f = (line: number, note: string, extra: Partial<LLFrame> = {}): LLFrame => ({ next: next.slice(), ptrs: { prev, cur, nxt }, line, note, ...extra });
      yield f(2, 'نبدأ: prev فارغ، وcur على الرأس.');
      for (;;) {
        yield f(3, cur === null ? 'cur فارغ: انتهت القائمة.' : 'ما زال هناك عقدة.');
        if (cur === null) break;
        nxt = next[cur]; yield f(4, 'احفظ العقدة التالية قبل أن نفقدها.');
        next[cur] = prev; yield f(5, 'اقلب السهم: العقدة الحالية تشير الآن إلى السابقة.', { changed: cur });
        prev = cur; cur = nxt; yield f(6, 'تقدّم خطوة: prev وcur يتحركان معًا.');
      }
      yield f(7, 'prev هو الرأس الجديد. كل سهم قُلب مرة واحدة: Θ(n) زمنًا وΘ(1) ذاكرة إضافية.', { done: true });
    },
  },
  {
    key: 'mid', label: 'المنتصف (سلحفاة وأرنب)',
    nodes: row([5, 8, 2, 6, 1, 9, 3]),
    pseudo: ['MIDDLE(head):', '  slow ← head;  fast ← head', '  while fast ≠ null and fast.next ≠ null:', '    slow ← slow.next', '    fast ← fast.next.next', '  return slow'],
    *run() {
      const next = chain(7);
      let slow: number | null = 0, fast: number | null = 0;
      const f = (line: number, note: string, extra: Partial<LLFrame> = {}): LLFrame => ({ next: next.slice(), ptrs: { slow, fast }, line, note, ...extra });
      yield f(2, 'المؤشران يبدآن عند الرأس.');
      for (;;) {
        const go = fast !== null && next[fast] !== null;
        yield f(3, go ? 'الأرنب يستطيع القفز خطوتين.' : 'الأرنب وصل إلى النهاية.');
        if (!go) break;
        slow = next[slow!]; yield f(4, 'السلحفاة: خطوة واحدة.');
        fast = next[next[fast!]!]; yield f(5, 'الأرنب: خطوتان.');
      }
      yield f(6, 'حين يصل الأرنب إلى النهاية تكون السلحفاة في المنتصف، لأنها قطعت نصف مسافته. مرور واحد، دون معرفة الطول مسبقًا.', { done: true });
    },
  },
  {
    key: 'cycle', label: 'كشف الحلقة (Floyd)',
    nodes: [...row([0, 1, 2, 3, 4, 5]), { val: '6', x: 5, y: 1 }, { val: '7', x: 4, y: 1 }],
    pseudo: ['FIND-CYCLE(head):', '  slow ← head;  fast ← head', '  repeat:', '    if fast or fast.next is null: return NO CYCLE', '    slow ← slow.next;  fast ← fast.next.next', '  until slow = fast', '  slow ← head', '  while slow ≠ fast:  slow ← slow.next;  fast ← fast.next', '  return slow   // where the cycle starts'],
    *run() {
      const next: (number | null)[] = [1, 2, 3, 4, 5, 6, 7, 3];
      let slow: number | null = 0, fast: number | null = 0;
      const f = (line: number, note: string, extra: Partial<LLFrame> = {}): LLFrame => ({ next: next.slice(), ptrs: { slow, fast }, line, note, ...extra });
      yield f(2, 'العقدة 7 تشير إلى العقدة 3: هناك حلقة طولها 5. لكن الخوارزمية لا تعرف ذلك.');
      for (;;) {
        slow = next[slow!]; fast = next[next[fast!]!];
        yield f(5, 'خطوة للسلحفاة وخطوتان للأرنب. داخل الحلقة يقترب الأرنب منها بخطوة كل مرة.');
        if (slow === fast) break;
      }
      yield f(6, 'التقيا! فهناك حلقة: في قائمة بلا حلقة يصل الأرنب إلى النهاية ولا يلتقيان.');
      slow = 0; yield f(7, 'المرحلة الثانية: أعد السلحفاة إلى الرأس، والأرنب يبقى مكانه.');
      while (slow !== fast) { slow = next[slow!]; fast = next[fast!]; yield f(8, 'الآن يتحركان بالسرعة نفسها، خطوة خطوة.'); }
      yield f(9, `التقيا عند العقدة ${slow}: بداية الحلقة. ذاكرة إضافية ثابتة: مؤشران فقط.`, { done: true });
    },
  },
  {
    key: 'del', label: 'الحذف مع عقدة حارسة',
    nodes: [{ val: 'S', x: 0, y: 0, sentinel: true }, ...row([4, 2, 4, 4, 7, 4], 0, 1)],
    pseudo: ['DELETE-ALL(head, x):', '  dummy.next ← head;  p ← dummy', '  while p.next ≠ null:', '    if p.next.val = x:', '      p.next ← p.next.next     // unlink', '    else:', '      p ← p.next', '  return dummy.next'],
    *run() {
      const next: (number | null)[] = [1, 2, 3, 4, 5, 6, null];
      const vals = ['S', '4', '2', '4', '4', '7', '4'];
      const gone: number[] = [];
      let p: number | null = 0;
      const f = (line: number, note: string, extra: Partial<LLFrame> = {}): LLFrame => ({ next: next.slice(), ptrs: { p }, line, note, gone: gone.slice(), ...extra });
      yield f(2, 'نحذف كل 4. العقدة الحارسة S قبل الرأس تجعل حذف الرأس نفسه مثل أي حذف آخر.');
      for (;;) {
        const q: number | null = next[p!];
        yield f(3, q === null ? 'لا عقدة بعد p.' : 'افحص العقدة بعد p.');
        if (q === null) break;
        if (vals[q] === '4') { next[p!] = next[q]; gone.push(q); yield f(5, `العقدة ${vals[q]} تُتجاوز: p يشير الآن إلى ما بعدها. لا نتقدم، فقد تكون التالية 4 أيضًا.`, { changed: p! }); }
        else { p = q; yield f(7, 'ليست 4: تقدّم.'); }
      }
      yield f(8, 'الرأس الجديد هو dummy.next. مرور واحد، Θ(n).', { done: true });
    },
  },
  {
    key: 'merge', label: 'دمج قائمتين مرتبتين',
    nodes: [{ val: 'D', x: 0, y: 1, sentinel: true }, ...row([1, 4, 7, 9], 0, 1), ...row([2, 3, 8], 2, 1)],
    pseudo: ['MERGE(a, b):', '  tail ← dummy', '  while a ≠ null and b ≠ null:', '    if a.val ≤ b.val: tail.next ← a;  a ← a.next', '    else:             tail.next ← b;  b ← b.next', '    tail ← tail.next', '  tail.next ← (a ≠ null ? a : b)', '  return dummy.next'],
    *run() {
      // 0 = dummy, 1..4 = list a, 5..7 = list b
      const vals = [0, 1, 4, 7, 9, 2, 3, 8];
      const next: (number | null)[] = [null, 2, 3, 4, null, 6, 7, null];
      let a: number | null = 1, b: number | null = 5, tail = 0;
      const f = (line: number, note: string, extra: Partial<LLFrame> = {}): LLFrame => ({ next: next.slice(), ptrs: { a, b, tail }, line, note, ...extra });
      yield f(2, 'لا ننسخ أي عقدة: نعيد توجيه الأسهم فقط.');
      while (a !== null && b !== null) {
        yield f(3, `قارن ${vals[a]} و${vals[b]}.`);
        if (vals[a] <= vals[b]) { next[tail] = a; const t = tail; a = next[a]; yield f(4, 'خذ من a.', { changed: t }); }
        else { next[tail] = b; const t = tail; b = next[b]; yield f(5, 'خذ من b.', { changed: t }); }
        tail = next[tail]!; yield f(6, 'tail يتقدم إلى آخر عقدة في الناتج.');
      }
      next[tail] = a !== null ? a : b; yield f(7, 'إحدى القائمتين انتهت: الصق الباقي كله بسهم واحد.', { changed: tail });
      yield f(8, 'الدمج في المكان: Θ(n + m) زمنًا وΘ(1) ذاكرة إضافية، بخلاف دمج المصفوفات.', { done: true });
    },
  },
];

/** Follow next pointers from a start node (stops on revisiting). */
export function walk(next: (number | null)[], start: number | null, limit = 50): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  for (let c = start; c !== null && !seen.has(c) && out.length < limit; c = next[c]) { out.push(c); seen.add(c); }
  return out;
}

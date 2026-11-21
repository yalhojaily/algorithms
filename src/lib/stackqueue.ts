// Stacks and queues for lesson 2.4: a circular array queue, a bracket checker and a postfix evaluator.

// ---------- Circular array queue (ArrayQueue) ----------
export interface CQState { a: (number | null)[]; head: number; n: number; copies: number; last?: string; code?: string }

export function cqNew(cap = 4): CQState { return { a: Array(cap).fill(null), head: 0, n: 0, copies: 0 }; }

function cqResize(q: CQState, cap: number): CQState {
  const b: (number | null)[] = Array(cap).fill(null);
  for (let k = 0; k < q.n; k++) b[k] = q.a[(q.head + k) % q.a.length];
  return { a: b, head: 0, n: q.n, copies: q.copies + q.n };
}

export function cqEnqueue(q0: CQState, x: number): CQState {
  let q = { ...q0, a: q0.a.slice() };
  let note = '';
  if (q.n === q.a.length) { q = cqResize(q, 2 * q.a.length); note = `امتلأت: نسخ ${q0.n} عناصر إلى مصفوفة سعتها ${2 * q0.a.length}، مرتبة من head. `; }
  const tail = (q.head + q.n) % q.a.length;
  q.a[tail] = x;
  q.n++;
  return { ...q, last: `${note}العنصر الجديد يُكتب في الموضع:`, code: `enqueue(${x}) → (head + n) mod cap = (${q.head} + ${q.n - 1}) mod ${q.a.length} = ${tail}` };
}

export function cqDequeue(q0: CQState): CQState {
  if (q0.n === 0) return { ...q0, last: 'الطابور فارغ.', code: undefined };
  let q = { ...q0, a: q0.a.slice() };
  const x = q.a[q.head];
  q.a[q.head] = null;
  q.head = (q.head + 1) % q.a.length;
  q.n--;
  let note = '';
  if (q.a.length > 4 && q.n <= q.a.length / 4) { q = cqResize(q, q.a.length / 2); note = ` الربع فقط ممتلئ: تصغير إلى ${q.a.length}.`; }
  return { ...q, last: `أُخرج العنصر الأول، وhead يتقدم بواحد، ويلتف إلى 0 بعد آخر خانة.${note}`, code: `dequeue() = ${x};  head = ${q0.head} → ${q.head}` };
}

// ---------- Balanced brackets ----------
export interface BrFrame { i: number; stack: string[]; note: string; ok?: boolean; bad?: boolean }
const PAIR: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

export function* bracketFrames(s: string): Generator<BrFrame> {
  const st: string[] = [];
  yield { i: -1, stack: [], note: 'نمر على النص حرفًا حرفًا.' };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if ('([{'.includes(c)) { st.push(c); yield { i, stack: st.slice(), note: `«${c}» يفتح: ادفعه إلى المكدس.` }; }
    else if (')]}'.includes(c)) {
      if (!st.length) { yield { i, stack: [], note: `«${c}» يغلق، لكن المكدس فارغ: لا يوجد ما يغلقه.`, bad: true }; return; }
      const top = st.pop()!;
      if (top !== PAIR[c]) { yield { i, stack: st.slice(), note: `«${c}» يغلق، لكن آخر قوس مفتوح «${top}»: لا يتطابقان.`, bad: true }; return; }
      yield { i, stack: st.slice(), note: `«${c}» يغلق آخر قوس مفتوح «${top}»: أخرجه.` };
    } else yield { i, stack: st.slice(), note: `«${c}» ليس قوسًا: تجاهله.` };
  }
  if (st.length) yield { i: s.length, stack: st.slice(), note: `انتهى النص وفي المكدس ${st.length} قوس لم يُغلق.`, bad: true };
  else yield { i: s.length, stack: [], note: 'انتهى النص والمكدس فارغ: الأقواس متوازنة.', ok: true };
}

export function isBalanced(s: string) {
  let last: BrFrame | undefined;
  for (const f of bracketFrames(s)) last = f;
  return !!last?.ok;
}

// ---------- Postfix evaluation ----------
export interface PfFrame { i: number; stack: number[]; note: string; done?: boolean; error?: boolean }

export function* postfixFrames(tokens: string[]): Generator<PfFrame> {
  const st: number[] = [];
  yield { i: -1, stack: [], note: 'الأعداد تُدفع، وكل عملية تأخذ آخر عددين.' };
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if ('+-*/'.includes(t)) {
      if (st.length < 2) { yield { i, stack: st.slice(), note: `«${t}» تحتاج إلى عددين.`, error: true }; return; }
      const b = st.pop()!, a = st.pop()!;
      const v = t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : a / b;
      st.push(v);
      yield { i, stack: st.slice(), note: `أخرج ${b} ثم ${a}، واحسب ${a} ${t} ${b} = ${v}، وادفع الناتج.` };
    } else { st.push(Number(t)); yield { i, stack: st.slice(), note: `عدد: ادفعه.` }; }
  }
  if (st.length === 1) yield { i: tokens.length, stack: st.slice(), note: `النتيجة ${st[0]}.`, done: true };
  else yield { i: tokens.length, stack: st.slice(), note: 'بقي أكثر من عدد في المكدس: التعبير ناقص.', error: true };
}

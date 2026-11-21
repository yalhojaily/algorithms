// Binary search trees (lesson 2.13) and AVL trees (lesson 2.14), recorded frame by frame.
// Keys are unique numbers, so a node is identified by its key in the frames.

export interface TNode { key: number; left: TNode | null; right: TNode | null; h: number }

export const node = (key: number): TNode => ({ key, left: null, right: null, h: 1 });
export const ht = (t: TNode | null) => (t ? t.h : 0);
export const fix = (t: TNode) => { t.h = 1 + Math.max(ht(t.left), ht(t.right)); };
export const bal = (t: TNode) => ht(t.left) - ht(t.right);

export function clone(t: TNode | null): TNode | null {
  return t ? { key: t.key, left: clone(t.left), right: clone(t.right), h: t.h } : null;
}
export function inorder(t: TNode | null, out: number[] = []): number[] {
  if (t) { inorder(t.left, out); out.push(t.key); inorder(t.right, out); }
  return out;
}
export function height(t: TNode | null): number { return t ? 1 + Math.max(height(t.left), height(t.right)) : 0; }
export function size(t: TNode | null): number { return t ? 1 + size(t.left) + size(t.right) : 0; }
export function fixAll(t: TNode | null): number { if (!t) return 0; t.h = 1 + Math.max(fixAll(t.left), fixAll(t.right)); return t.h; }

export interface BFrame {
  root: TNode | null;
  path: number[];          // keys visited so far
  hl: number | null;       // key being looked at now
  mark?: number | null;    // a second key to mark (successor, rotation pivot)
  out?: number[];          // in-order output so far
  line: number;
  note: string;
  done?: boolean;
  rot?: string;
}

export type BstOp = 'search' | 'insert' | 'delete' | 'inorder';

export const BST_PSEUDO: Record<BstOp, string[]> = {
  search: [
    'SEARCH(t, x):',
    '  while t ≠ NIL:',
    '    if x = t.key: return t',
    '    t ← (x < t.key) ? t.left : t.right',
    '  return NIL',
  ],
  insert: [
    'INSERT(t, x):',
    '  walk down as in SEARCH',
    '  if x = t.key: return        ▷ already there',
    '  the first NIL you reach becomes node(x)',
  ],
  delete: [
    'DELETE(t, x):',
    '  find the node z with key x',
    '  if z has no children: remove z',
    '  elif z has one child: splice it into z’s place',
    '  else: s ← MIN(z.right)        ▷ successor',
    '        z.key ← s.key; DELETE s from z.right',
  ],
  inorder: [
    'INORDER(t):',
    '  if t = NIL: return',
    '  INORDER(t.left)',
    '  output t.key',
    '  INORDER(t.right)',
  ],
};

export function* bstFrames(root0: TNode | null, op: BstOp, x = 0): Generator<BFrame> {
  let root = clone(root0);
  const path: number[] = [];
  const F = (o: Partial<BFrame> & Pick<BFrame, 'line' | 'note'>): BFrame => ({ root: clone(root), path: path.slice(), hl: null, ...o });

  if (op === 'inorder') {
    const out: number[] = [];
    function* go(t: TNode | null): Generator<BFrame> {
      if (!t) return;
      path.push(t.key);
      yield F({ hl: t.key, out: out.slice(), line: 3, note: `عند ${t.key}: نزور اليسار أولًا` });
      yield* go(t.left);
      out.push(t.key);
      yield F({ hl: t.key, out: out.slice(), line: 4, note: `نُخرج ${t.key}` });
      yield* go(t.right);
      path.pop();
    }
    yield F({ out: [], line: 1, note: 'المرور بالترتيب: يسار، ثم الجذر، ثم يمين' });
    yield* go(root);
    yield F({ out, line: 1, note: `الناتج مرتب: ${out.length} عنصرًا في Θ(n)`, done: true });
    return;
  }

  // walk down
  let t = root, parent: TNode | null = null;
  yield F({ line: 1, note: op === 'search' ? `نبحث عن ${x}` : op === 'insert' ? `ندرج ${x}` : `نحذف ${x}` });
  while (t && t.key !== x) {
    path.push(t.key);
    yield F({ hl: t.key, line: op === 'search' ? 4 : 2, note: `${x} ${x < t.key ? '<' : '>'} ${t.key}: ننزل ${x < t.key ? 'يسارًا' : 'يمينًا'}` });
    parent = t;
    t = x < t.key ? t.left : t.right;
  }
  if (t) path.push(t.key);

  if (op === 'search') {
    yield t
      ? F({ hl: x, line: 3, note: `وجدنا ${x} بعد ${path.length} مقارنة`, done: true })
      : F({ line: 5, note: `وصلنا إلى NIL: ${x} غير موجود (${path.length} مقارنة)`, done: true });
    return;
  }
  if (op === 'insert') {
    if (t) { yield F({ hl: x, line: 3, note: `${x} موجود بالفعل`, done: true }); return; }
    const n = node(x);
    if (!parent) root = n; else if (x < parent.key) parent.left = n; else parent.right = n;
    fixAll(root);
    path.push(x);
    yield F({ hl: x, line: 4, note: `أضفنا ${x} ورقةً ${parent ? `${x < parent.key ? 'يسار' : 'يمين'} ${parent.key}` : 'جذرًا'}`, done: true });
    return;
  }
  // delete
  if (!t) { yield F({ line: 2, note: `${x} غير موجود`, done: true }); return; }
  const z = t;
  const replace = (child: TNode | null) => {
    if (!parent) root = child; else if (parent.left === z) parent.left = child; else parent.right = child;
  };
  if (!z.left && !z.right) {
    yield F({ hl: x, line: 3, note: `${x} ورقة: نحذفها مباشرة` });
    replace(null);
  } else if (!z.left || !z.right) {
    const c = (z.left ?? z.right)!;
    yield F({ hl: x, mark: c.key, line: 4, note: `${x} له ابن واحد (${c.key}): يأخذ الابن مكانه` });
    replace(c);
  } else {
    let sp = z, s = z.right;
    path.push(s.key);
    yield F({ hl: x, mark: s.key, line: 5, note: `${x} له ابنان: نبحث عن التالي له، أصغر عنصر في يمينه` });
    while (s.left) { sp = s; s = s.left; path.push(s.key); yield F({ hl: x, mark: s.key, line: 5, note: `ننزل يسارًا إلى ${s.key}` }); }
    yield F({ hl: x, mark: s.key, line: 6, note: `التالي ${s.key}: ننسخه مكان ${x}، ثم نحذفه من مكانه (له ابن أيمن على الأكثر)` });
    z.key = s.key;
    if (sp === z) sp.right = s.right; else sp.left = s.right;
  }
  fixAll(root);
  yield F({ hl: null, line: 1, note: `حُذف ${x}`, done: true });
}

// ---------------- AVL ----------------

export const AVL_PSEUDO = [
  'AVL-INSERT(t, x):',
  '  insert x as in a BST, then on the way back up:',
  '  update t.h ← 1 + max(h(t.left), h(t.right))',
  '  if bal(t) = +2:                ▷ left too tall',
  '    if bal(t.left) < 0: t.left ← ROTATE-LEFT(t.left)',
  '    t ← ROTATE-RIGHT(t)',
  '  if bal(t) = −2: mirror image',
  '  return t',
];

export function rotR(y: TNode): TNode { const x = y.left!; y.left = x.right; x.right = y; fix(y); fix(x); return x; }
export function rotL(x: TNode): TNode { const y = x.right!; x.right = y.left; y.left = x; fix(x); fix(y); return y; }

/** Insert into an AVL tree, yielding a frame for every node on the way down and up, and for every rotation. */
export function* avlFrames(root0: TNode | null, x: number): Generator<BFrame> {
  let root = clone(root0);
  const path: number[] = [];
  const F = (o: Partial<BFrame> & Pick<BFrame, 'line' | 'note'>): BFrame => ({ root: clone(root), path: path.slice(), hl: null, ...o });
  let rotations = 0;

  // Insert recursively; `set` re-attaches the (possibly new) subtree root to its parent.
  function* ins(t: TNode | null, set: (n: TNode) => void): Generator<BFrame, void> {
    if (!t) { set(node(x)); path.push(x); yield F({ hl: x, line: 2, note: `أضفنا ${x} ورقةً` }); return; }
    if (x === t.key) { yield F({ hl: x, line: 2, note: `${x} موجود بالفعل` }); return; }
    path.push(t.key);
    yield F({ hl: t.key, line: 2, note: `${x} ${x < t.key ? '<' : '>'} ${t.key}: ننزل ${x < t.key ? 'يسارًا' : 'يمينًا'}` });
    if (x < t.key) yield* ins(t.left, (n) => { t.left = n; });
    else yield* ins(t.right, (n) => { t.right = n; });
    fix(t);
    const b = bal(t);
    if (Math.abs(b) <= 1) {
      yield F({ hl: t.key, line: 3, note: `نصعد إلى ${t.key}: الارتفاع ${t.h}، والتوازن ${b > 0 ? '+' : ''}${b}. لا مشكلة` });
      return;
    }
    yield F({ hl: t.key, line: b > 0 ? 4 : 7, note: `${t.key} غير متوازن: التوازن ${b > 0 ? '+2' : '−2'}` });
    let kind: string;
    let nt: TNode;
    if (b > 0) {
      if (bal(t.left!) < 0) {
        kind = 'LR';
        yield F({ hl: t.key, mark: t.left!.key, line: 5, rot: 'LR', note: `حالة يسار-يمين: ندير ${t.left!.key} يسارًا أولًا`, });
        t.left = rotL(t.left!);
        set(t);
        yield F({ hl: t.key, mark: t.left!.key, line: 5, rot: 'LR', note: 'صارت حالة يسار-يسار' });
      } else kind = 'LL';
      nt = rotR(t);
    } else {
      if (bal(t.right!) > 0) {
        kind = 'RL';
        yield F({ hl: t.key, mark: t.right!.key, line: 7, rot: 'RL', note: `حالة يمين-يسار: ندير ${t.right!.key} يمينًا أولًا` });
        t.right = rotR(t.right!);
        set(t);
        yield F({ hl: t.key, mark: t.right!.key, line: 7, rot: 'RL', note: 'صارت حالة يمين-يمين' });
      } else kind = 'RR';
      nt = rotL(t);
    }
    set(nt);
    rotations++;
    yield F({ hl: nt.key, mark: t.key, line: b > 0 ? 6 : 7, rot: kind, note: `دوران ${b > 0 ? 'يميني' : 'يساري'} (حالة ${kind}): ${nt.key} صار جذر هذا الجزء، والارتفاع عاد ${nt.h}` });
  }

  yield F({ line: 1, note: `ندرج ${x}` });
  yield* ins(root, (n) => { root = n; });
  yield F({ line: 8, note: `انتهى: الارتفاع ${ht(root)}${rotations ? `، بعد ${rotations === 1 ? 'دوران واحد' : 'دورانين'}` : '، بلا دوران'}`, done: true });
}

export function avlInsert(root: TNode | null, x: number): TNode {
  const ins = (t: TNode | null): TNode => {
    if (!t) return node(x);
    if (x === t.key) return t;
    if (x < t.key) t.left = ins(t.left); else t.right = ins(t.right);
    fix(t);
    const b = bal(t);
    if (b > 1) { if (bal(t.left!) < 0) t.left = rotL(t.left!); return rotR(t); }
    if (b < -1) { if (bal(t.right!) > 0) t.right = rotR(t.right!); return rotL(t); }
    return t;
  };
  return ins(root);
}

export function bstInsert(root: TNode | null, x: number): TNode {
  const n = node(x);
  if (!root) return n;
  let t = root;
  for (;;) {
    if (x === t.key) return root;
    if (x < t.key) { if (!t.left) { t.left = n; break; } t = t.left; }
    else { if (!t.right) { t.right = n; break; } t = t.right; }
  }
  fixAll(root);
  return root;
}

export function isAVL(t: TNode | null): boolean {
  if (!t) return true;
  return Math.abs(height(t.left) - height(t.right)) <= 1 && isAVL(t.left) && isAVL(t.right);
}

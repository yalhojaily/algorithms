// Starter and model-solution code for the lab in lesson 2.13.

export const starter = `// A binary search tree of distinct numbers. Nodes are { key, left, right }.
// Every method may walk down one path only: O(h), where h is the height.
class BST {
  constructor() { this.root = null; this.n = 0; }

  size() { return this.n; }

  // Height of the tree: 0 for an empty tree, 1 for a single node.
  height() { /* your code here */ }

  has(x) { /* your code here */ }

  // Insert x. Return true if it was inserted, false if it was already there.
  insert(x) { /* your code here */ }

  // Remove x. Return true if it was removed, false if it was not there.
  // Three cases: no child, one child, two children (use the successor).
  delete(x) { /* your code here */ }

  // All keys in increasing order (in-order traversal).
  inorder() { /* your code here */ }

  // The smallest key strictly greater than x, or null. x need not be in the tree.
  successor(x) { /* your code here */ }

  // The largest key less than or equal to x, or null.
  floor(x) { /* your code here */ }
}

// Tree sort: insert every element of A (distinct numbers) into a BST, then read it in order.
function treeSort(A) {
  // your code here
}
`;

export const solution = `class BST {
  constructor() { this.root = null; this.n = 0; }

  size() { return this.n; }

  height() {
    // iterative, level by level, so a degenerate tree does not overflow the stack
    let h = 0, level = this.root ? [this.root] : [];
    while (level.length) {
      h++;
      const next = [];
      for (const t of level) { if (t.left) next.push(t.left); if (t.right) next.push(t.right); }
      level = next;
    }
    return h;
  }

  has(x) {
    let t = this.root;
    while (t) { if (x === t.key) return true; t = x < t.key ? t.left : t.right; }
    return false;
  }

  insert(x) {
    const node = { key: x, left: null, right: null };
    if (!this.root) { this.root = node; this.n++; return true; }
    let t = this.root;
    for (;;) {
      if (x === t.key) return false;
      const side = x < t.key ? 'left' : 'right';
      if (!t[side]) { t[side] = node; this.n++; return true; }
      t = t[side];
    }
  }

  delete(x) {
    let parent = null, t = this.root;
    while (t && t.key !== x) { parent = t; t = x < t.key ? t.left : t.right; }
    if (!t) return false;
    if (t.left && t.right) {
      // copy the successor's key here, then remove the successor (it has no left child)
      let sp = t, s = t.right;
      while (s.left) { sp = s; s = s.left; }
      t.key = s.key;
      if (sp === t) sp.right = s.right; else sp.left = s.right;
    } else {
      const child = t.left || t.right;
      if (!parent) this.root = child;
      else if (parent.left === t) parent.left = child;
      else parent.right = child;
    }
    this.n--;
    return true;
  }

  inorder() {
    const out = [], stack = [];
    let t = this.root;
    while (t || stack.length) {
      while (t) { stack.push(t); t = t.left; }
      t = stack.pop();
      out.push(t.key);
      t = t.right;
    }
    return out;
  }

  successor(x) {
    let t = this.root, best = null;
    while (t) {
      if (t.key > x) { best = t.key; t = t.left; }   // a candidate; look for a smaller one
      else t = t.right;
    }
    return best;
  }

  floor(x) {
    let t = this.root, best = null;
    while (t) {
      if (t.key <= x) { best = t.key; t = t.right; }
      else t = t.left;
    }
    return best;
  }
}

function treeSort(A) {
  const T = new BST();
  for (const x of A) T.insert(x);
  return T.inorder();
}
`;

// Starter and model-solution code for the lab in lesson 2.14.

export const starter = `// AVL nodes are { key, left, right, height }. A leaf has height 1; an empty tree (null) has height 0.
function newNode(key) { return { key, left: null, right: null, height: 1 }; }

// 1) The height of a subtree, null-safe.
function height(t) {
  // your code here
}

// 2) Right rotation around y (y.left becomes the new root of this subtree).
//    Fix the heights of the two nodes that moved, lower one first. Return the new root.
//         y            x
//        / \\          / \\
//       x   C   →    A   y
//      / \\              / \\
//     A   B            B   C
function rotateRight(y) {
  // your code here
}

// 3) Left rotation: the mirror image.
function rotateLeft(x) {
  // your code here
}

// 4) AVL insert: insert key into the tree rooted at t (ignore duplicates) and return the new root.
//    On the way back up: update the height, and if the balance h(left) − h(right) is ±2,
//    fix it with one or two rotations (cases LL, LR, RR, RL).
function insert(t, key) {
  // your code here
}

// 5) Build an AVL tree from the keys of A, in that order. Return the root.
function buildAVL(A) {
  // your code here
}
`;

export const solution = `function newNode(key) { return { key, left: null, right: null, height: 1 }; }

function height(t) { return t ? t.height : 0; }

function update(t) { t.height = 1 + Math.max(height(t.left), height(t.right)); }

function rotateRight(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  update(y);   // y is now below x: fix it first
  update(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  update(x);
  update(y);
  return y;
}

function insert(t, key) {
  if (!t) return newNode(key);
  if (key === t.key) return t;
  if (key < t.key) t.left = insert(t.left, key);
  else t.right = insert(t.right, key);
  update(t);
  const b = height(t.left) - height(t.right);
  if (b > 1) {
    if (height(t.left.left) < height(t.left.right)) t.left = rotateLeft(t.left);    // LR
    return rotateRight(t);                                                           // LL
  }
  if (b < -1) {
    if (height(t.right.right) < height(t.right.left)) t.right = rotateRight(t.right); // RL
    return rotateLeft(t);                                                            // RR
  }
  return t;
}

function buildAVL(A) {
  let root = null;
  for (const k of A) root = insert(root, k);
  return root;
}
`;

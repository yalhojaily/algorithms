// Starter and model-solution code for the lab in book section 3.10.

export const starter = `// Independent sets in rooted trees. A tree is { children: [ ...trees ] }, and in part 3
// every node also has a number "fun".

// 1) The size of the largest independent set (no node together with its parent).
function treeMIS(root) {
  // your code here (TreeMIS2: compute yes/no for every node in post-order)
}

// 2) The set itself, as an array of node objects.
function treeMISSet(root) {
  // your code here
}

// 3) Weighted version: the largest total "fun" of an independent set (fun may be negative).
function maxFun(root) {
  // your code here
}
`;

export const solution = `function treeMIS(root) {
  // TreeMIS2 without recursion: list the nodes so that every parent comes before its children,
  // then process the list backwards, so every node comes after its children (a post-order).
  const order = [root];
  for (let k = 0; k < order.length; k++) for (const w of order[k].children) order.push(w);
  const yes = new Map(), no = new Map();
  for (let k = order.length - 1; k >= 0; k--) {
    const v = order[k];
    let y = 1, z = 0;
    for (const w of v.children) { y += no.get(w); z += Math.max(yes.get(w), no.get(w)); }
    yes.set(v, y); no.set(v, z);
  }
  return Math.max(yes.get(root), no.get(root));
}

function treeMISSet(root) {
  const memo = new Map();
  const go = (v) => {
    let yes = 1, no = 0;
    for (const w of v.children) { const [y, z] = go(w); yes += z; no += Math.max(y, z); }
    memo.set(v, [yes, no]);
    return [yes, no];
  };
  go(root);
  const out = [];
  const pick = (v, parentIn) => {
    const [y, z] = memo.get(v);
    const take = !parentIn && y >= z;
    if (take) out.push(v);
    for (const w of v.children) pick(w, take);
  };
  pick(root, false);
  return out;
}

function maxFun(root) {
  const go = (v) => {
    let yes = v.fun, no = 0;
    for (const w of v.children) { const [y, z] = go(w); yes += z; no += Math.max(y, z); }
    return [yes, no];
  };
  return Math.max(...go(root));
}
`;

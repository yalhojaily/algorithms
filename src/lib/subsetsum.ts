// Book 2.3: the recursion tree of SubsetSum(X, i, T).

export interface SNode {
  id: number;
  i: number;
  T: number;
  edge: 'root' | 'with' | 'wout';
  value: boolean | null;      // null if never evaluated (short-circuit)
  children: SNode[];
  depth: number;
  order: number;              // DFS visit order
}

/** Builds the tree. With `shortCircuit`, the second call is skipped when the first returns True. */
export function subsetTree(X: number[], T: number, shortCircuit: boolean) {
  let id = 0, order = 0;
  const go = (i: number, t: number, edge: SNode['edge'], depth: number): SNode => {
    const node: SNode = { id: id++, i, T: t, edge, value: null, children: [], depth, order: order++ };
    if (t === 0) node.value = true;
    else if (t < 0 || i === 0) node.value = false;
    else {
      const w = go(i - 1, t - X[i - 1], 'with', depth + 1);
      node.children.push(w);
      if (shortCircuit && w.value) node.value = true;
      else {
        const o = go(i - 1, t, 'wout', depth + 1);
        node.children.push(o);
        node.value = !!(w.value || o.value);
      }
    }
    return node;
  };
  const root = go(X.length, T, 'root', 0);
  return { root, count: id };
}

/** One subset (as indices, 1-based) summing to T, following ConstructSubset (wout first, like the book). */
export function constructSubset(X: number[], i: number, T: number): number[] | null {
  if (T === 0) return [];
  if (T < 0 || i === 0) return null;
  const y = constructSubset(X, i - 1, T);
  if (y) return y;
  const z = constructSubset(X, i - 1, T - X[i - 1]);
  return z ? [...z, i] : null;
}

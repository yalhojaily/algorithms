// Book 1.10: the exponents an algorithm computes on its way to a^n (an "addition chain").

export interface Chain { exps: number[]; steps: { from: [number, number]; to: number }[] }

const push = (c: Chain, x: number, y: number) => { const to = x + y; c.steps.push({ from: [x, y], to }); c.exps.push(to); return to; };

export function slowChain(n: number): Chain {
  const c: Chain = { exps: [1], steps: [] };
  let e = 1;
  while (e < n) e = push(c, e, 1);
  return c;
}

/** Piṅgala: a^n = (a^⌊n/2⌋)² · (a if n is odd). Reads the bits of n from the most significant end. */
export function pingalaChain(n: number): Chain {
  const c: Chain = { exps: [1], steps: [] };
  const go = (k: number): number => {
    if (k === 1) return 1;
    const h = go(Math.floor(k / 2));
    let e = push(c, h, h);
    if (k % 2) e = push(c, e, 1);
    return e;
  };
  go(n);
  return c;
}

/** Peasant: square a repeatedly, and multiply the squares that match the 1-bits of n (least significant first). */
export function peasantChain(n: number): Chain {
  const c: Chain = { exps: [1], steps: [] };
  let sq = 1, acc = 0, k = n;
  while (k > 0) {
    if (k % 2) acc = acc === 0 ? sq : push(c, acc, sq);
    k = Math.floor(k / 2);
    if (k > 0) sq = push(c, sq, sq);
  }
  return c;
}

/** A shortest addition chain for n (iterative deepening over star chains; fine for n ≤ 300). */
export function optimalChain(n: number): Chain {
  if (n === 1) return { exps: [1], steps: [] };
  const lower = Math.ceil(Math.log2(n));
  for (let L = lower; L <= 2 * lower; L++) {
    const chain = [1];
    const steps: { from: [number, number]; to: number }[] = [];
    const dfs = (): boolean => {
      const last = chain[chain.length - 1];
      if (last === n) return true;
      if (chain.length - 1 >= L) return false;
      if (last * 2 ** (L - (chain.length - 1)) < n) return false;
      for (let i = chain.length - 1; i >= 0; i--) {
        for (let j = i; j >= 0; j--) {
          const s = chain[i] + chain[j];
          if (s <= last || s > n) continue;
          chain.push(s); steps.push({ from: [chain[i], chain[j]], to: s });
          if (dfs()) return true;
          chain.pop(); steps.pop();
        }
      }
      return false;
    };
    if (dfs()) return { exps: chain.slice(), steps: steps.slice() };
  }
  return pingalaChain(n);
}

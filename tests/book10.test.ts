import { describe, expect, it } from 'vitest';
import { rng } from '../src/lib/bookgraphs';
import { FLOW_NET, badNet, cap, cutCapacity, decomposeFrames, excess, fordFulkersonFrames, type Net } from '../src/lib/flow';

const randNet = (seed: number): Net => {
  const r = rng(seed), n = 3 + Math.floor(r() * 5), edges: [number, number, number][] = [];
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && v !== 0 && u !== n - 1 && r() < 0.4 && !edges.some(([a, b]) => a === v && b === u)) edges.push([u, v, 1 + Math.floor(r() * 9)]);
  return { names: [...Array(n)].map((_, i) => String(i)), xy: [], edges };
};
const bruteMinCut = (net: Net) => {
  const n = net.names.length; let best = Infinity;
  for (let m = 0; m < 1 << (n - 2); m++) { const S = new Set([0]); for (let i = 1; i < n - 1; i++) if (m >> (i - 1) & 1) S.add(i); best = Math.min(best, cutCapacity(net, S)); }
  return best;
};

describe('max flow', () => {
  it('every rule finds max flow = min cut, the flow is feasible, and S is a min cut', () => {
    for (let t = 0; t <= 80; t++) {
      const net = t === 0 ? FLOW_NET : randNet(t), mc = bruteMinCut(net);
      for (const rule of ['dfs', 'bfs', 'fat'] as const) {
        const last = fordFulkersonFrames(net, rule).at(-1)!;
        expect(last.value).toBe(mc);
        last.f.forEach((x, k) => { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(cap(net, k)); });
        const ex = excess(net, last.f);
        for (let v = 1; v < net.names.length - 1; v++) expect(ex[v]).toBe(0);
        expect(cutCapacity(net, new Set(last.S!))).toBe(mc);
      }
    }
    expect(fordFulkersonFrames(FLOW_NET, 'bfs').at(-1)!.value).toBe(23);
  });
  it('shortest paths need 2 iterations on the bad example', () => {
    expect(fordFulkersonFrames(badNet(1000), 'bfs').length - 1).toBe(2);
  });
  it('decomposition rebuilds the flow', () => {
    const f = fordFulkersonFrames(FLOW_NET, 'dfs').at(-1)!.f;
    const D = decomposeFrames(FLOW_NET, f).at(-1)!;
    const back = FLOW_NET.edges.map(() => 0);
    for (const p of D.done) for (const k of p.edges) back[k] += p.amount;
    expect(back).toEqual(f);
    expect(D.done.length).toBeLessThanOrEqual(FLOW_NET.edges.length);
  });
});

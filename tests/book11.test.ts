import { describe, expect, it } from 'vitest';
import { rng } from '../src/lib/bookgraphs';
import {
  AL_EAST, BIP, COVER_DAG, DP_G, EXAMS, PROJECTS, bestProjects, coverBip, coverPaths, edgeNet, eliminated, matchingFrames,
  maxflow, missing, schedule, splitNet, unitPaths, type CapEdge, type League,
} from '../src/lib/flowapps';

const bruteCut = (n: number, E: CapEdge[], s: number, t: number) => {
  let best = Infinity;
  for (let m = 0; m < 1 << n; m++) {
    if (!(m >> s & 1) || (m >> t & 1)) continue;
    let c = 0; for (const [u, v, w] of E) if ((m >> u & 1) && !(m >> v & 1)) c += w;
    best = Math.min(best, c);
  }
  return best;
};

describe('general max flow', () => {
  it('equals a brute-force min cut, with antiparallel and infinite edges', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const r = rng(seed), n = 2 + Math.floor(r() * 6), E: CapEdge[] = [];
      for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && r() < 0.35) E.push([u, v, r() < 0.1 ? Infinity : 1 + Math.floor(r() * 6)]);
      const mf = maxflow(n, E, 0, n - 1), bc = bruteCut(n, E, 0, n - 1);
      if (bc === Infinity) continue;
      expect(mf.value).toBe(bc);
      // the cut side S is a minimum cut
      expect(E.reduce((a, [u, v, c]) => a + (mf.S![u] && !mf.S![v] ? c : 0), 0)).toBe(bc);
    }
  });
});

describe('disjoint paths', () => {
  it('DP_G: three edge-disjoint paths, two vertex-disjoint ones', () => {
    const s = 0, t = DP_G.names.length - 1, E = edgeNet(DP_G), mf = maxflow(8, E, s, t);
    expect(mf.value).toBe(3);
    const P = unitPaths(8, E, mf.f, s, t);
    expect(P.length).toBe(3);
    expect(new Set(P.flatMap((p) => p.edges)).size).toBe(P.reduce((a, p) => a + p.edges.length, 0));
    const sp = splitNet(DP_G, s, t), vf = maxflow(sp.n, sp.E, 2 * s, 2 * t + 1);
    expect(vf.value).toBe(2);
  });
});

describe('matching', () => {
  it('BIP has a maximum matching of size 5, and M is always a matching', () => {
    const fr = matchingFrames(BIP), last = fr.at(-1)!;
    expect(last.M.length).toBe(5);
    expect(Math.max(...fr.map((f) => f.pathEdges.length))).toBe(9);
    for (const { M } of fr) {
      const Ls = M.map((k) => BIP.E[k][0]), Rs = M.map((k) => BIP.E[k][1]);
      expect(new Set(Ls).size).toBe(M.length); expect(new Set(Rs).size).toBe(M.length);
    }
    expect(fr.some((f) => f.pathEdges.length > 1)).toBe(true);   // some alternating path is longer than one edge
  });
  it('path cover of COVER_DAG: V − |M| paths covering every vertex once', () => {
    const last = matchingFrames(coverBip(COVER_DAG)).at(-1)!, P = coverPaths(COVER_DAG, last.M);
    expect(P.length).toBe(COVER_DAG.names.length - last.M.length);
    expect(P.flat().sort()).toEqual(COVER_DAG.names.map((_, i) => i));
    expect(P.length).toBe(2);
  });
});

describe('exam scheduling', () => {
  it('the default instance schedules every class validly', () => {
    const { rows } = schedule(EXAMS);
    expect(rows.every((r) => r)).toBe(true);
    const used = new Set<string>(), per = [0, 0], pt = new Set<string>();
    rows.forEach((r, i) => {
      const [room, time, pr] = r!;
      expect(EXAMS.enroll[i]).toBeLessThanOrEqual(EXAMS.seats[room]);
      expect(EXAMS.avail[time][pr]).toBe(true);
      expect(used.has(`${room},${time}`)).toBe(false); used.add(`${room},${time}`);
      expect(pt.has(`${pr},${time}`)).toBe(false); pt.add(`${pr},${time}`);
      per[pr]++;
    });
    expect(Math.max(...per)).toBeLessThanOrEqual(EXAMS.maxPer);
    expect(schedule({ ...EXAMS, maxPer: 1 }).value).toBe(2);
  });
});

describe('baseball', () => {
  it('Detroit is eliminated (26 < 27); the others are not', () => {
    const d = eliminated(AL_EAST, 4);
    expect(d.games).toBe(27); expect(d.flow).toBe(26); expect(d.out).toBe(true);
    for (const x of [0, 1, 2, 3]) expect(eliminated(AL_EAST, x).out).toBe(false);
  });
  it('agrees with brute force over all outcomes on small leagues', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const r = rng(seed), n = 3 + Math.floor(r() * 2), G = [...Array(n)].map(() => Array(n).fill(0));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) G[i][j] = G[j][i] = Math.floor(r() * 3);
      const W = [...Array(n)].map(() => Math.floor(r() * 6)), left = G.map((row) => row.reduce((a, b) => a + b, 0));
      const L: League = { teams: W.map((_, i) => String(i)), W, left, G };
      for (let x = 0; x < n; x++) {
        const games: [number, number][] = [];
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (i !== x && j !== x) for (let g = 0; g < G[i][j]; g++) games.push([i, j]);
        let can = false;
        for (let m = 0; m < 1 << games.length && !can; m++) {
          const w = [...W]; w[x] += left[x];
          games.forEach(([i, j], k) => { w[(m >> k) & 1 ? i : j]++; });
          if (w.every((v) => v <= w[x])) can = true;
        }
        expect(eliminated(L, x).out).toBe(!can);
      }
    }
  });
});

describe('project selection', () => {
  it('the min cut gives the best closed set (brute force)', () => {
    const b = bestProjects(PROJECTS), n = PROJECTS.profit.length;
    let best = -Infinity;
    for (let m = 0; m < 1 << n; m++) {
      const sel = PROJECTS.profit.map((_, v) => !!(m >> v & 1));
      if (missing(PROJECTS, sel).length) continue;
      best = Math.max(best, PROJECTS.profit.reduce((a, w, v) => a + (sel[v] ? w : 0), 0));
    }
    expect(b.profit).toBe(best); expect(best).toBe(7); expect(b.cut).toBe(8);
    expect(missing(PROJECTS, b.sel).length).toBe(0);
  });
});

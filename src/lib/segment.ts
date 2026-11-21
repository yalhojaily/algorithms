// Book 2.5: Splittable(i) over a suffix, recorded call by call, with how often each suffix is visited.

export const WORDS = [
  'a', 'and', 'art', 'arts', 'at', 'bot', 'both', 'earth', 'hand', 'hands', 'he', 'hear', 'heart', 'hearth',
  'in', 'is', 'oil', 'pin', 'pins', 'sat', 'saturn', 'spin', 'toil', 'urn', 'urns', 'artist', 'tart', 'ear', 'the',
  'than', 'turn', 'turns', 'or', 'tar', 'an', 'as', 'so', 'to', 'it', 'its', 'i', 'no', 'on', 'we', 'one', 'go',
];

export const isPalindrome = (w: string) => w.length > 0 && w === [...w].reverse().join('');

export interface SegFrame {
  i: number;                 // the suffix A[i..n] (0-based start)
  path: string[];            // words chosen so far
  trying: [number, number] | null;  // candidate word A[i..j] (0-based, inclusive)
  ok: boolean | null;        // result of IsWord on the candidate
  found: string[] | null;    // a complete segmentation just found
  visits: number[];          // calls to Splittable per start index so far
  isWordCalls: number;
}

/** Records the search. With `all`, it keeps going after success to count every segmentation. */
export function segmentFrames(A: string, isWord: (w: string) => boolean, all: boolean, max = 4000) {
  const n = A.length, visits = Array(n + 1).fill(0), out: SegFrame[] = [], sols: string[][] = [];
  let calls = 0, stopped = false;
  const push = (f: Omit<SegFrame, 'visits' | 'isWordCalls'>) => { if (out.length < max) out.push({ ...f, visits: [...visits], isWordCalls: calls }); };
  const go = (i: number, path: string[]): boolean => {
    visits[i]++;
    if (i === n) { sols.push([...path]); push({ i, path, trying: null, ok: null, found: [...path] }); return true; }
    let res = false;
    for (let j = i; j < n; j++) {
      if (stopped) return res;
      calls++;
      const w = A.slice(i, j + 1), ok = isWord(w);
      push({ i, path, trying: [i, j], ok, found: null });
      if (ok && go(j + 1, [...path, w])) {
        res = true;
        if (!all) { stopped = true; return true; }
      }
    }
    return res;
  };
  const result = go(0, []);
  out.push({ i: -1, path: [], trying: null, ok: null, found: null, visits: [...visits], isWordCalls: calls });
  return { frames: out, result, solutions: sols, visits, calls };
}

// Lesson book 1.1: four problems reduced to sorting, with the sort as a swappable black box.

export type BoxKind = 'insertion' | 'merge';
export interface BoxResult { sorted: number[]; comps: number }

export function blackBox(kind: BoxKind, A: number[]): BoxResult {
  let comps = 0;
  const less = (a: number, b: number) => { comps++; return a < b; };
  if (kind === 'insertion') {
    const B = A.slice();
    for (let i = 1; i < B.length; i++) {
      const x = B[i]; let j = i - 1;
      while (j >= 0 && less(x, B[j])) { B[j + 1] = B[j]; j--; }
      B[j + 1] = x;
    }
    return { sorted: B, comps };
  }
  const ms = (a: number[]): number[] => {
    if (a.length <= 1) return a;
    const m = a.length >> 1, L = ms(a.slice(0, m)), R = ms(a.slice(m)), out: number[] = [];
    let i = 0, j = 0;
    while (i < L.length && j < R.length) out.push(less(R[j], L[i]) ? R[j++] : L[i++]);
    return out.concat(L.slice(i), R.slice(j));
  };
  return { sorted: ms(A), comps };
}

export type ProblemKey = 'dup' | 'median' | 'mode' | 'gap';
export interface Problem { key: ProblemKey; ar: string; question: string; after: string; solve: (S: number[]) => { answer: string; steps: number } }

export const PROBLEMS: Problem[] = [
  {
    key: 'dup', ar: 'هل فيها تكرار؟', question: 'هل تظهر قيمة واحدة مرتين على الأقل؟',
    after: 'بعد الترتيب تتجاور القيم المتساوية، فنقارن كل عنصر بجاره فقط.',
    solve: (S) => { let steps = 0; for (let i = 1; i < S.length; i++) { steps++; if (S[i] === S[i - 1]) return { answer: `نعم: ${S[i]} مكررة`, steps }; } return { answer: 'لا تكرار', steps }; },
  },
  {
    key: 'median', ar: 'الوسيط', question: 'ما القيمة التي في منتصف الترتيب؟',
    after: 'بعد الترتيب، الوسيط هو العنصر في المنتصف: خطوة واحدة.',
    solve: (S) => ({ answer: String(S[(S.length - 1) >> 1]), steps: 1 }),
  },
  {
    key: 'mode', ar: 'المنوال', question: 'ما أكثر قيمة تكرارًا؟',
    after: 'بعد الترتيب تصير كل قيمة كتلة متصلة، فنعدّ أطوال الكتل في مرور واحد.',
    solve: (S) => {
      let best = S[0], bc = 0, c = 0, steps = 0;
      for (let i = 0; i < S.length; i++) { steps++; c = i && S[i] === S[i - 1] ? c + 1 : 1; if (c > bc) { bc = c; best = S[i]; } }
      return { answer: `${best} (${bc} ${bc > 2 && bc < 11 ? 'مرات' : 'مرة'})`, steps };
    },
  },
  {
    key: 'gap', ar: 'أكبر فجوة', question: 'ما أكبر فرق بين قيمتين متتاليتين في الترتيب؟',
    after: 'بعد الترتيب، القيمتان المتتاليتان متجاورتان، فنمر مرة واحدة ونحتفظ بأكبر فرق.',
    solve: (S) => { let g = 0, steps = 0; for (let i = 1; i < S.length; i++) { steps++; g = Math.max(g, S[i] - S[i - 1]); } return { answer: String(g), steps }; },
  },
];

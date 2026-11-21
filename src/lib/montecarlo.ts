// Monte Carlo experiments for lesson 0.10, with a seeded random generator so runs are reproducible.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Trial { value: number; text: string }

export interface Experiment {
  key: string;
  label: string;
  /** What the estimate means (probability or average). */
  measure: 'prob' | 'mean';
  exact: (p: number) => number;
  exactTex: (p: number) => string;
  param?: { label: string; values: number[]; initial: number };
  run: (rand: () => number, p: number) => Trial;
  pseudo: (p: number) => string[];
}

const randInt = (rand: () => number, n: number) => Math.floor(rand() * n);
const H = (n: number) => { let s = 0; for (let i = 1; i <= n; i++) s += 1 / i; return s; };

export const EXPERIMENTS: Experiment[] = [
  {
    key: 'monty', label: 'Monty Hall', measure: 'prob',
    param: { label: 'الاستراتيجية', values: [0, 1], initial: 1 },
    exact: (p) => (p ? 2 / 3 : 1 / 3), exactTex: (p) => (p ? '\\tfrac{2}{3}' : '\\tfrac{1}{3}'),
    run: (rand, sw) => {
      const car = randInt(rand, 3), pick = randInt(rand, 3);
      const options = [0, 1, 2].filter((d) => d !== car && d !== pick);
      const opened = options[randInt(rand, options.length)];
      const final = sw ? [0, 1, 2].find((d) => d !== pick && d !== opened)! : pick;
      const win = final === car;
      return { value: win ? 1 : 0, text: `السيارة خلف الباب ${car + 1}، واخترت ${pick + 1}، ففتح المقدّم ${opened + 1}. ${sw ? `بدّلت إلى ${final + 1}` : 'بقيت على اختيارك'}: ${win ? 'ربحت' : 'خسرت'}.` };
    },
    pseudo: (sw) => ['car ← random door; pick ← random door', 'host opens a goat door ≠ pick', sw ? 'switch to the other closed door' : 'stay with pick', 'win ← (final = car)'],
  },
  {
    key: 'birthday', label: 'عيد الميلاد', measure: 'prob',
    param: { label: 'عدد الأشخاص', values: [10, 23, 40, 57], initial: 23 },
    exact: (k) => { let q = 1; for (let i = 0; i < k; i++) q *= (365 - i) / 365; return 1 - q; },
    exactTex: (k) => `1 - \\prod_{i=0}^{${k - 1}} \\tfrac{365 - i}{365}`,
    run: (rand, k) => {
      const seen = new Map<number, number>();
      for (let i = 0; i < k; i++) {
        const d = randInt(rand, 365);
        if (seen.has(d)) return { value: 1, text: `الشخصان ${seen.get(d)! + 1} و${i + 1} وُلدا في اليوم ${d + 1} من السنة.` };
        seen.set(d, i);
      }
      return { value: 0, text: `لم يشترك اثنان من الـ ${k} في يوم ميلاد.` };
    },
    pseudo: (k) => [`for i ← 1 to ${k}: day[i] ← random(1..365)`, 'collision ← some day appears twice'],
  },
  {
    key: 'coupon', label: 'جامع الكوبونات', measure: 'mean',
    param: { label: 'عدد الأنواع n', values: [6, 10, 50, 100], initial: 10 },
    exact: (n) => n * H(n), exactTex: (n) => `n H_n = ${n} \\cdot H_{${n}}`,
    run: (rand, n) => {
      const got = new Set<number>();
      let t = 0;
      while (got.size < n) { got.add(randInt(rand, n)); t++; }
      return { value: t, text: `احتجنا إلى ${t} محاولة لجمع الأنواع الـ ${n} كلها.` };
    },
    pseudo: () => ['seen ← ∅; t ← 0', 'while |seen| < n:', '  seen ← seen ∪ {random(1..n)}; t ← t + 1', 'return t'],
  },
  {
    key: 'hats', label: 'القبعات المختلطة', measure: 'mean',
    param: { label: 'عدد الأشخاص n', values: [3, 10, 100, 1000], initial: 10 },
    exact: () => 1, exactTex: () => '1',
    run: (rand, n) => {
      const a = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) { const j = randInt(rand, i + 1); [a[i], a[j]] = [a[j], a[i]]; }
      const fixed = a.filter((x, i) => x === i).length;
      return { value: fixed, text: `${fixed} من ${n} شخصًا أخذوا قبعاتهم الصحيحة.` };
    },
    pseudo: () => ['hats ← random permutation of 1..n', 'X ← #{ i : hats[i] = i }'],
  },
];

export const CHECKPOINTS = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000];

export interface McFrame { trials: number; mean: number; last: Trial; history: [number, number][] }

export function runExperiment(e: Experiment, p: number, seed = 2026): McFrame[] {
  const rand = mulberry32(seed);
  const frames: McFrame[] = [];
  let sum = 0;
  const history: [number, number][] = [];
  let last: Trial = { value: 0, text: '' };
  let c = 0;
  for (let t = 1; t <= CHECKPOINTS[CHECKPOINTS.length - 1]; t++) {
    last = e.run(rand, p);
    sum += last.value;
    if (t === CHECKPOINTS[c]) {
      history.push([t, sum / t]);
      frames.push({ trials: t, mean: sum / t, last, history: [...history] });
      c++;
    }
  }
  return frames;
}

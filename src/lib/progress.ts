// Learner progress, stored in the browser (localStorage).

export interface LessonProgress {
  visited?: boolean;
  done?: boolean;
  doneAt?: string;
  /** Ids of quick checks answered correctly. */
  checks: string[];
  /** Ids of exercises the learner marked as solved. */
  exercises: string[];
  /** Whether all lab tests passed at least once. */
  lab?: boolean;
}

type Store = Record<string, LessonProgress>;

const KEY = 'algo:progress:v1';
const EVENT = 'algo:progress';

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — progress just won't persist */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

const blank = (): LessonProgress => ({ checks: [], exercises: [] });

function update(id: string, fn: (l: LessonProgress) => void) {
  const s = read();
  const l = { ...blank(), ...(s[id] ?? {}) };
  fn(l);
  s[id] = l;
  write(s);
}

export const getLesson = (id: string): LessonProgress => ({ ...blank(), ...(read()[id] ?? {}) });
export const getAll = (): Store => read();

export const markVisited = (id: string) => update(id, (l) => { l.visited = true; });
export const setDone = (id: string, done: boolean) =>
  update(id, (l) => { l.done = done; l.doneAt = done ? new Date().toISOString() : undefined; });
export const markCheck = (id: string, check: string) =>
  update(id, (l) => { if (!l.checks.includes(check)) l.checks.push(check); });
export const toggleExercise = (id: string, ex: string) =>
  update(id, (l) => { l.exercises = l.exercises.includes(ex) ? l.exercises.filter((e) => e !== ex) : [...l.exercises, ex]; });
export const markLab = (id: string) => update(id, (l) => { l.lab = true; });
export function resetLesson(id: string) {
  const s = read();
  delete s[id];
  write(s);
}

export function onProgress(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/** The lesson id of the page we're on — set by the lesson layout on <main data-lesson>. */
export function currentLesson(): string {
  return (document.querySelector('[data-lesson]') as HTMLElement | null)?.dataset.lesson ?? 'unknown';
}

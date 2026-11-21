import { useEffect, useState } from 'react';

// The learner's own record of each book exercise: not started, solved, or stuck. Stored in this browser.
const KEY = 'algo:book:ex:v1';
const EVENT = 'algo:book:ex';
type St = 'solved' | 'stuck';
const read = (): Record<string, St> => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; } };
const write = (s: Record<string, St>) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } window.dispatchEvent(new CustomEvent(EVENT)); };
export const exKey = (chapter: number, num: number) => `${chapter}:${num}`;
export const readBookEx = read;
export const BOOK_EX_EVENT = EVENT;

export default function BookExStatus({ chapter, num }: { chapter: number; num: number }) {
  const k = exKey(chapter, num);
  const [st, setSt] = useState<St | undefined>();
  useEffect(() => { const sync = () => setSt(read()[k]); sync(); window.addEventListener(EVENT, sync); return () => window.removeEventListener(EVENT, sync); }, [k]);
  const set = (v: St) => { const s = read(); if (s[k] === v) delete s[k]; else s[k] = v; write(s); };
  return (
    <span className="bxs">
      <button className={`bxs-b ${st === 'solved' ? 'on ok' : ''}`} onClick={() => set('solved')} aria-pressed={st === 'solved'}>✓ حللته</button>
      <button className={`bxs-b ${st === 'stuck' ? 'on stuck' : ''}`} onClick={() => set('stuck')} aria-pressed={st === 'stuck'}>أعود إليه</button>
    </span>
  );
}

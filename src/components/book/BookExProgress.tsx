import { useEffect, useState } from 'react';
import { BOOK_EX_EVENT, exKey, readBookEx } from './BookExStatus';

/** "solved / total" for a list of book exercises. */
export default function BookExProgress({ chapter, nums, label = 'حللت' }: { chapter: number; nums: number[]; label?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => { const s = readBookEx(); setN(nums.filter((x) => s[exKey(chapter, x)] === 'solved').length); };
    sync(); window.addEventListener(BOOK_EX_EVENT, sync); return () => window.removeEventListener(BOOK_EX_EVENT, sync);
  }, [chapter, nums]);
  return <span className="bxp">{label} <b className="ltr">{n}</b> من <b className="ltr">{nums.length}</b></span>;
}

// Cut page images of the book (made by tools/extract_erickson.py).
import ch00 from '../../data/book-pages/ch00.json';
import ch01 from '../../data/book-pages/ch01.json';
import ch02 from '../../data/book-pages/ch02.json';
import ch03 from '../../data/book-pages/ch03.json';
import ch04 from '../../data/book-pages/ch04.json';

export interface Strip { src: string; w: number; h: number; page: number }
export interface ChapterPages {
  chapter: number;
  reading: Record<string, Strip[]>;
  exercises: { num: number; group: string | null; strips: Strip[] }[];
}

const ALL: Record<number, ChapterPages> = { 0: ch00 as ChapterPages, 1: ch01 as ChapterPages, 2: ch02 as ChapterPages, 3: ch03 as ChapterPages, 4: ch04 as ChapterPages };

export const chapterPages = (n: number): ChapterPages => ALL[n];
export const readingStrips = (sectionId: string): Strip[] => ALL[+sectionId.split('.')[0]]?.reading[sectionId] ?? [];
export const exerciseStrips = (chapter: number, num: number) => ALL[chapter]?.exercises.find((e) => e.num === num);

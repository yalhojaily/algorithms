// Cut page images of the book (made by tools/extract_erickson.py).
import ch00 from '../../data/book-pages/ch00.json';
import ch01 from '../../data/book-pages/ch01.json';
import ch02 from '../../data/book-pages/ch02.json';
import ch03 from '../../data/book-pages/ch03.json';
import ch04 from '../../data/book-pages/ch04.json';
import ch05 from '../../data/book-pages/ch05.json';
import ch06 from '../../data/book-pages/ch06.json';
import ch07 from '../../data/book-pages/ch07.json';
import ch08 from '../../data/book-pages/ch08.json';
import ch09 from '../../data/book-pages/ch09.json';
import ch10 from '../../data/book-pages/ch10.json';
import ch11 from '../../data/book-pages/ch11.json';

export interface Strip { src: string; w: number; h: number; page: number }
export interface ChapterPages {
  chapter: number;
  reading: Record<string, Strip[]>;
  exercises: { num: number; group: string | null; strips: Strip[] }[];
}

const ALL: Record<number, ChapterPages> = { 0: ch00 as ChapterPages, 1: ch01 as ChapterPages, 2: ch02 as ChapterPages, 3: ch03 as ChapterPages, 4: ch04 as ChapterPages, 5: ch05 as ChapterPages, 6: ch06 as ChapterPages, 7: ch07 as ChapterPages, 8: ch08 as ChapterPages, 9: ch09 as ChapterPages, 10: ch10 as ChapterPages, 11: ch11 as ChapterPages };

export const chapterPages = (n: number): ChapterPages => ALL[n];
export const readingStrips = (sectionId: string): Strip[] => ALL[+sectionId.split('.')[0]]?.reading[sectionId] ?? [];
export const exerciseStrips = (chapter: number, num: number) => ALL[chapter]?.exercises.find((e) => e.num === num);

import { useState } from 'react';
import { MathText } from './MathText';
import { currentLesson, markCheck } from '../lib/progress';

interface Props {
  /** Unique within the lesson; used to remember that it was answered. */
  id: string;
  /** The question. May contain $...$. */
  question: string;
  /** Answer choices. May contain $...$. */
  options: string[];
  /** Index of the correct choice. */
  answer: number;
  /** Why the correct choice is right, shown once it is picked. */
  explain: string;
  /** Optional feedback for specific wrong choices, by index. */
  wrong?: Record<number, string>;
}

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

/** "توقّف وتحقق": a one-click question between sections, with instant feedback and an explanation. */
export default function QuickCheck({ id, question, options, answer, explain, wrong = {} }: Props) {
  const [tried, setTried] = useState<number[]>([]);
  const last = tried[tried.length - 1];
  const solved = tried.includes(answer);
  const pick = (i: number) => {
    if (solved || tried.includes(i)) return;
    setTried([...tried, i]);
    if (i === answer && tried.length === 0) markCheck(currentLesson(), id);
  };
  return (
    <div className="qc card" role="group" aria-label="سؤال فهم">
      <div className="qc-head">
        <span className="qc-icon" aria-hidden="true">✋</span>
        <span className="qc-kicker">توقّف وتحقق</span>
        <span className="qc-tip">{solved ? '' : 'اختر إجابة'}</span>
      </div>
      <MathText as="div" className="qc-q">{question}</MathText>
      <div className="qc-options">
        {options.map((o, i) => {
          const state = tried.includes(i) ? (i === answer ? 'ok' : 'bad') : solved ? 'dim' : '';
          return (
            <button key={i} className={`qc-opt ${state}`} onClick={() => pick(i)} disabled={solved || tried.includes(i)} aria-pressed={tried.includes(i)}>
              <span className="qc-letter">{LETTERS[i]}</span>
              <MathText>{o}</MathText>
            </button>
          );
        })}
      </div>
      {solved ? (
        <>
          <div className="qc-feedback ok" aria-live="polite"><span className="qc-mark">✓</span><div><strong>{tried.length === 1 ? 'صحيح!' : 'نعم، هذا هو.'}</strong> <MathText>{explain}</MathText></div></div>
          <button className="btn btn-ghost btn-sm qc-reset" onClick={() => setTried([])}>↺ أعد المحاولة</button>
        </>
      ) : last !== undefined ? (
        <div className="qc-feedback bad" aria-live="polite"><span className="qc-mark">✗</span><div><strong>ليس تمامًا.</strong> <MathText>{wrong[last] ?? 'فكّر مرة أخرى وجرّب خيارًا آخر.'}</MathText></div></div>
      ) : null}
    </div>
  );
}

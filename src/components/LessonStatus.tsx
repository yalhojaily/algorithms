import { useEffect, useState } from 'react';
import { getLesson, markVisited, onProgress, resetLesson, setDone, type LessonProgress } from '../lib/progress';

/** Status pill in the lesson header (also marks the lesson as visited), or the "finish lesson" panel at the end. */
export default function LessonStatus({ lesson, exercises = 0, variant = 'pill' }: { lesson: string; exercises?: number; variant?: 'pill' | 'finish' }) {
  const [p, setP] = useState<LessonProgress | null>(null);
  useEffect(() => {
    if (variant === 'pill') markVisited(lesson);
    const sync = () => setP(getLesson(lesson));
    sync();
    return onProgress(sync);
  }, [lesson, variant]);
  if (!p) return <span className="ls ls-loading" />;

  if (variant === 'finish') {
    return (
      <div className={`finish card ${p.done ? 'done' : ''}`}>
        <div>
          <div className="finish-title">{p.done ? '★ أنهيت هذا الدرس' : 'هل أنهيت الدرس؟'}</div>
          <div className="finish-stats">
            <span>أسئلة الفهم: <b>{p.checks.length}</b></span>
            <span>التمارين المحلولة: <b>{p.exercises.length}{exercises ? ` / ${exercises}` : ''}</b></span>
            <span>المختبر: <b>{p.lab ? 'نجحت كل الاختبارات ✓' : 'لم يكتمل بعد'}</b></span>
          </div>
        </div>
        <button className={`btn ${p.done ? '' : 'btn-primary'}`} onClick={() => setDone(lesson, !p.done)}>
          {p.done ? 'إلغاء الإنهاء' : '✓ علّم الدرس منتهيًا'}
        </button>
      </div>
    );
  }

  const started = p.checks.length + p.exercises.length > 0 || p.lab;
  return (
    <span className={`ls ${p.done ? 'done' : ''}`}>
      {p.done ? '★ منتهٍ' : started ? 'قيد الدراسة' : 'لم يبدأ'}
      {(p.done || started) && (
        <button className="ls-reset" title="امسح تقدّمك في هذا الدرس" onClick={() => { if (confirm('هل تريد مسح تقدّمك في هذا الدرس؟')) resetLesson(lesson); }}>
          مسح
        </button>
      )}
    </span>
  );
}

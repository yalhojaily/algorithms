import { useEffect, useState } from 'react';
import type React from 'react';
import type { Phase } from '../data/curriculum';
import { getAll, onProgress, type LessonProgress } from '../lib/progress';

interface Props {
  phases: Phase[];
  /** Lesson ids that have content, mapped to their URL. */
  available: Record<string, string>;
  /** Phase key → URL of the phase page. */
  phaseLinks: Record<string, string>;
}

type Status = 'done' | 'started' | 'ready' | 'soon';

/** The whole journey as a map: phases in order, each lesson colored by your progress, prerequisites on hover. */
export default function CourseMap({ phases, available, phaseLinks }: Props) {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setProgress(getAll());
    sync();
    return onProgress(sync);
  }, []);

  const all = phases.flatMap((p) => p.lessons);
  const focused = all.find((l) => l.id === focus);
  const prereqSet = new Set(focused?.prereqs ?? []);
  const unlocks = new Set(all.filter((l) => focus && l.prereqs.includes(focus)).map((l) => l.id));

  const status = (id: string): Status => {
    if (!available[id]) return 'soon';
    const p = progress[id];
    if (p?.done) return 'done';
    if (p?.visited) return 'started';
    return 'ready';
  };
  const doneCount = all.filter((l) => progress[l.id]?.done).length;

  return (
    <div className="cm">
      <div className="cm-bar">
        <div className="cm-progress" aria-label={`${doneCount} من ${all.length} دروس منتهية`}>
          <div className="cm-progress-fill" style={{ width: `${(doneCount / all.length) * 100}%` }} />
        </div>
        <span className="cm-count"><b className="ltr">{doneCount} / {all.length}</b> درسًا منتهيًا</span>
        <span className="cm-legend">
          <i className="lg done" /> منتهٍ <i className="lg started" /> قيد الدراسة <i className="lg ready" /> متاح <i className="lg soon" /> قريبًا
        </span>
      </div>
      <div className="cm-hint">{focused ? (
        <>
          <strong>{focused.id} {focused.title}</strong>
          {focused.prereqs.length ? <> يعتمد على <span className="cm-pre-chip ltr">{focused.prereqs.join('، ')}</span></> : <> نقطة بداية</>}
          {unlocks.size > 0 && <> · يمهّد لـ <span className="cm-next-chip ltr">{[...unlocks].join('، ')}</span></>}
        </>
      ) : 'مرّر المؤشر على درس (أو انتقل إليه بـ Tab) لترى ما يعتمد عليه وما يمهّد له.'}</div>

      <div className="cm-phases">
        {phases.map((p) => (
          <section key={p.key} className="cm-ph">
            <header className="cm-ph-head">
              <span className="cm-ph-num">{p.number}</span>
              <div className="cm-ph-text">
                <a className="cm-ph-title" href={phaseLinks[p.key]}>{p.title}</a>
                <span className="cm-ph-meta">
                  <span className="en">{p.en}</span> · الأسابيع <span className="ltr">{p.weeks[0]}–{p.weeks[1]}</span> · {p.lessons.length} دروس
                </span>
              </div>
            </header>
            <ol className="cm-lessons">
              {p.lessons.map((l) => {
                const st = status(l.id);
                const rel = l.id === focus ? 'self' : prereqSet.has(l.id) ? 'pre' : unlocks.has(l.id) ? 'next' : '';
                const inner = (
                  <>
                    <span className="cm-id">{l.id}</span>
                    <span className="cm-name">{l.title}</span>
                    <span className="cm-week">أ{l.week}</span>
                    {st === 'done' && <span className="cm-star" aria-label="منتهٍ">★</span>}
                  </>
                );
                // Only a real mouse hover or keyboard focus highlights prerequisites; on phones a tap also fires
                // hover/focus, and re-rendering then would make iOS swallow the tap on the link.
                const common = {
                  className: `cm-lesson ${st} ${rel}`,
                  onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') setFocus(l.id); },
                  onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') setFocus(null); },
                  onFocus: (e: React.FocusEvent<HTMLElement>) => { if (e.currentTarget.matches(':focus-visible')) setFocus(l.id); },
                  onBlur: () => setFocus(null),
                };
                return (
                  <li key={l.id}>
                    {available[l.id] ? <a href={available[l.id]} {...common}>{inner}</a> : <span tabIndex={0} {...common}>{inner}</span>}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        <section className="cm-ph cm-review">
          <header className="cm-ph-head">
            <span className="cm-ph-num">★</span>
            <div className="cm-ph-text">
              <span className="cm-ph-title">المراجعة النهائية</span>
              <span className="cm-ph-meta">الأسبوع 26 · واجب شامل لكل مرحلة واختبار نهائي</span>
            </div>
          </header>
        </section>
      </div>
    </div>
  );
}

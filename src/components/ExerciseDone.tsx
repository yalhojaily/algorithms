import { useEffect, useState } from 'react';
import { currentLesson, getLesson, onProgress, toggleExercise } from '../lib/progress';

/** "حللتها" toggle on each exercise — the learner's own record of what they have solved. */
export default function ExerciseDone({ id }: { id: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const sync = () => setDone(getLesson(currentLesson()).exercises.includes(id));
    sync();
    return onProgress(sync);
  }, [id]);
  return (
    <button className={`ex-done ${done ? 'on' : ''}`} onClick={() => toggleExercise(currentLesson(), id)} aria-pressed={done}>
      {done ? '✓ حللتها' : 'علّمها محلولة'}
    </button>
  );
}

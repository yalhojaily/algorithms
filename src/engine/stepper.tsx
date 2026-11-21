// The step engine. Every simulation on the site is a list of frames (snapshots of the algorithm's state),
// usually produced by a generator. This hook and the <Player> below give every simulation the same
// controls: play / pause, step forward and back, jump to start or end, scrub, and change speed.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Collect every frame a generator yields. Capped so a buggy generator can't freeze the page. */
export function record<S>(gen: Generator<S>, max = 5000): S[] {
  const out: S[] = [];
  for (const s of gen) {
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

export interface Stepper<S> {
  frames: S[];
  i: number;
  frame: S;
  playing: boolean;
  speed: number; // steps per second
  atStart: boolean;
  atEnd: boolean;
  go: (i: number) => void;
  next: () => void;
  prev: () => void;
  toggle: () => void;
  setSpeed: (s: number) => void;
}

export function useStepper<S>(frames: S[], initialSpeed = 2): Stepper<S> {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const last = frames.length - 1;

  // New frames (the learner changed the input): start over.
  useEffect(() => { setI(0); setPlaying(false); }, [frames]);

  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setI((k) => {
        if (k >= last) { setPlaying(false); return k; }
        return k + 1;
      });
    }, 1000 / speed);
    return () => window.clearInterval(timer.current);
  }, [playing, speed, last]);

  const go = useCallback((k: number) => setI(Math.max(0, Math.min(last, k))), [last]);
  const next = useCallback(() => { setPlaying(false); setI((k) => Math.min(last, k + 1)); }, [last]);
  const prev = useCallback(() => { setPlaying(false); setI((k) => Math.max(0, k - 1)); }, []);
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && i >= last) setI(0); // replay from the start
      return !p;
    });
  }, [i, last]);

  return useMemo(() => ({
    frames, i: Math.min(i, last), frame: frames[Math.min(i, last)], playing, speed,
    atStart: i <= 0, atEnd: i >= last, go, next, prev, toggle, setSpeed,
  }), [frames, i, last, playing, speed, go, next, prev, toggle]);
}

const SPEEDS = [0.5, 1, 2, 3, 4, 6, 8, 12];

/** The shared control bar. Keyboard: ← next, → back (RTL), space play/pause. */
export function Player<S>({ s, label }: { s: Stepper<S>; label?: string }) {
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); s.next(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); s.prev(); }
    else if (e.key === ' ') { e.preventDefault(); s.toggle(); }
  };
  return (
    <div className="player" onKeyDown={onKey}>
      <div className="player-buttons">
        <button className="btn btn-sm" onClick={() => s.go(0)} disabled={s.atStart} title="إلى البداية" aria-label="إلى البداية">⇥</button>
        <button className="btn btn-sm" onClick={s.prev} disabled={s.atStart} title="الخطوة السابقة (→)">→ السابق</button>
        <button className="btn btn-sm btn-primary player-play" onClick={s.toggle} title="تشغيل / إيقاف (مسافة)">
          {s.playing ? '❚❚ إيقاف' : s.atEnd ? '↺ من جديد' : '▶ تشغيل'}
        </button>
        <button className="btn btn-sm" onClick={s.next} disabled={s.atEnd} title="الخطوة التالية (←)">التالي ←</button>
        <button className="btn btn-sm" onClick={() => s.go(s.frames.length - 1)} disabled={s.atEnd} title="إلى النهاية" aria-label="إلى النهاية">⇤</button>
      </div>
      <input
        className="player-scrub"
        type="range"
        min={0}
        max={Math.max(0, s.frames.length - 1)}
        value={s.i}
        onChange={(e) => s.go(Number(e.target.value))}
        aria-label={label ?? 'الخطوة'}
      />
      <div className="player-meta">
        <span className="player-count">الخطوة <b className="ltr">{s.i + 1} / {s.frames.length}</b></span>
        <label className="player-speed">
          السرعة
          <select value={s.speed} onChange={(e) => s.setSpeed(Number(e.target.value))}>
            {SPEEDS.map((v) => <option key={v} value={v}>{v}×</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}

/** Pseudocode with the line being executed highlighted. Lines are 1-based. */
export function Pseudocode({ lines, active, title = 'Pseudocode' }: { lines: string[]; active?: number | null; title?: string }) {
  return (
    <div className="pseudo" dir="ltr">
      <div className="pseudo-title">{title}</div>
      <ol>
        {lines.map((l, k) => (
          <li key={k} className={active === k + 1 ? 'on' : ''}>
            <span className="pseudo-n">{k + 1}</span>
            <code>{l.replace(/^ +/, (m) => ' '.repeat(m.length))}</code>
          </li>
        ))}
      </ol>
    </div>
  );
}

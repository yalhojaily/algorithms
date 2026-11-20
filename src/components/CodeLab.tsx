import { useEffect, useRef, useState } from 'react';
import { currentLesson, markLab } from '../lib/progress';

interface Test {
  name: string;
  /** A JavaScript expression using the exported functions. It passes if it evaluates to true. */
  code: string;
}

interface Bench {
  title: string;
  /** The exported function to time. */
  fn: string;
  /** A JavaScript expression using `n` that builds the argument for one call. */
  make: string;
  ns: number[];
}

interface Props {
  id: string;
  title: string;
  starter: string;
  exports: string[];
  tests: Test[];
  bench?: Bench;
  solution?: string;
}

type TestResult = { name: string; ok: boolean; msg?: string };
type BenchResult = { n: number; ms: number };

// The learner's code runs in a throwaway Web Worker, so an infinite loop can't freeze the page.
const WORKER = `
self.onmessage = (e) => {
  const { code, exports, tests, bench } = e.data;
  let mod;
  try {
    mod = new Function(code + '\\n;return {' + exports.map((x) => x + ': typeof ' + x + ' === "undefined" ? undefined : ' + x).join(',') + '};')();
  } catch (err) {
    self.postMessage({ fatal: 'خطأ في الكود: ' + err.message });
    return;
  }
  const missing = exports.filter((x) => typeof mod[x] !== 'function');
  const results = tests.map((t) => {
    try {
      const ok = new Function(...exports, 'return (' + t.code + ');')(...exports.map((x) => mod[x]));
      return { name: t.name, ok: ok === true, msg: ok === true ? undefined : 'النتيجة لا تطابق المتوقع' };
    } catch (err) {
      return { name: t.name, ok: false, msg: String(err && err.message || err) };
    }
  });
  let timing;
  if (bench && results.every((r) => r.ok)) {
    timing = [];
    for (const n of bench.ns) {
      const arg = new Function('n', 'return (' + bench.make + ');')(n);
      const t0 = performance.now();
      mod[bench.fn](arg);
      timing.push({ n, ms: performance.now() - t0 });
    }
  }
  self.postMessage({ results, timing, missing });
};
`;

export default function CodeLab({ id, title, starter, exports, tests, bench, solution }: Props) {
  const storeKey = `algo:lab:${id}`;
  const [code, setCode] = useState(starter);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [timing, setTiming] = useState<BenchResult[] | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [showSol, setShowSol] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storeKey);
      if (saved) setCode(saved);
    } catch {}
  }, [storeKey]);

  const save = (v: string) => {
    setCode(v);
    try { localStorage.setItem(storeKey, v); } catch {}
  };

  const runTests = () => {
    setRunning(true);
    setFatal(null);
    setResults(null);
    setTiming(null);
    const url = URL.createObjectURL(new Blob([WORKER], { type: 'text/javascript' }));
    const w = new Worker(url);
    const kill = window.setTimeout(() => {
      w.terminate();
      setRunning(false);
      setFatal('توقف التنفيذ بعد 8 ثوانٍ: هل في الكود حلقة لا تنتهي؟');
    }, 8000);
    w.onmessage = (e) => {
      window.clearTimeout(kill);
      w.terminate();
      URL.revokeObjectURL(url);
      setRunning(false);
      const d = e.data as { fatal?: string; results?: TestResult[]; timing?: BenchResult[]; missing?: string[] };
      if (d.fatal) return setFatal(d.fatal);
      if (d.missing?.length) setFatal(`لم أجد الدالة: ${d.missing.join('، ')}`);
      setResults(d.results ?? []);
      setTiming(d.timing ?? null);
      if (d.results?.length && d.results.every((r) => r.ok)) markLab(currentLesson());
    };
    w.postMessage({ code, exports, tests, bench });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const a = el.selectionStart;
      const z = el.selectionEnd;
      save(code.slice(0, a) + '  ' + code.slice(z));
      requestAnimationFrame(() => el.setSelectionRange(a + 2, a + 2));
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      runTests();
    }
  };

  const passed = results?.filter((r) => r.ok).length ?? 0;
  const maxMs = timing ? Math.max(...timing.map((t) => t.ms), 0.001) : 1;

  return (
    <div className="lab card">
      <div className="widget-head">
        <span className="widget-kicker">المختبر البرمجي</span>
        <span className="widget-title">{title}</span>
        <span className="lab-lang en">JavaScript</span>
      </div>
      <textarea
        ref={area}
        className="lab-editor"
        dir="ltr"
        value={code}
        onChange={(e) => save(e.target.value)}
        onKeyDown={onKey}
        spellCheck={false}
        rows={Math.min(34, Math.max(14, code.split('\n').length + 1))}
        aria-label="محرر الكود"
      />
      <div className="lab-actions">
        <button className="btn btn-primary" onClick={runTests} disabled={running}>{running ? '…يعمل' : '▶ شغّل الاختبارات'}</button>
        <span className="lab-hint">أو <kbd>Ctrl</kbd> + <kbd>Enter</kbd> · الكود يُحفظ تلقائيًا</span>
        <span className="lab-spacer" />
        <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('هل تريد إعادة الكود إلى نقطة البداية؟')) save(starter); }}>↺ ابدأ من جديد</button>
        {solution && <button className="btn btn-ghost btn-sm" onClick={() => setShowSol(!showSol)}>{showSol ? 'أخفِ الحل' : 'حل نموذجي'}</button>}
      </div>

      {fatal && <div className="lab-fatal">⚠️ {fatal}</div>}
      {results && (
        <div className="lab-results">
          <div className={`lab-summary ${passed === results.length ? 'all' : ''}`}>
            {passed === results.length ? `✓ نجحت كل الاختبارات (${passed})` : `نجح ${passed} من ${results.length}`}
          </div>
          <ul>
            {results.map((r) => (
              <li key={r.name} className={r.ok ? 'ok' : 'bad'}>
                <span className="lab-mark">{r.ok ? '✓' : '✗'}</span>
                <span>{r.name}</span>
                {r.msg && <span className="lab-msg" dir="auto">— {r.msg}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {bench && (
        <div className="lab-bench">
          <div className="lab-bench-title">📈 تجربة القياس: {bench.title}</div>
          {!timing ? (
            <div className="lab-bench-wait">تظهر النتائج هنا بعد أن تنجح كل الاختبارات.</div>
          ) : (
            <div className="bench-bars" dir="ltr">
              {timing.map((t) => (
                <div key={t.n} className="bench-row">
                  <span className="bench-n">n = {t.n}</span>
                  <span className="bench-bar"><span style={{ width: `${Math.max(1.5, (t.ms / maxMs) * 100)}%` }} /></span>
                  <span className="bench-ms">{t.ms < 1 ? t.ms.toFixed(2) : t.ms.toFixed(0)} ms</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showSol && solution && (
        <pre className="lab-solution" dir="ltr"><code>{solution}</code></pre>
      )}
    </div>
  );
}

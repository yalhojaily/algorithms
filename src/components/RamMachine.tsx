import { useMemo, useState } from 'react';
import { DAYS, PROGRAMS, type RamFrame } from '../lib/ram';
import { mulberry32 } from '../lib/montecarlo';
import { Player, Pseudocode, record, useStepper } from '../engine/stepper';

function makeInput(n: number, dup: boolean, seed: number): number[] {
  const rand = mulberry32(seed);
  const pool = Array.from({ length: DAYS }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const A = pool.slice(0, n);
  if (dup) A[n - 2] = A[Math.floor(n / 3)];
  return A;
}

/** A word-RAM at work: memory cells, the line being executed, and a running count of steps. */
export default function RamMachine() {
  const [pk, setPk] = useState('pairs');
  const [n, setN] = useState(10);
  const [dup, setDup] = useState(false);
  const [seed, setSeed] = useState(7);
  const P = PROGRAMS.find((p) => p.key === pk)!;
  const A = useMemo(() => makeInput(n, dup, seed), [n, dup, seed]);
  const frames = useMemo(() => record(P.run(A)), [P, A]);
  const s = useStepper<RamFrame>(frames, 6);
  const fr = s.frame;
  const total = frames[frames.length - 1].steps;

  return (
    <div className="widget card ram">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">آلة RAM: الذاكرة، والسطر المنفَّذ، وعدد الخطوات</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {PROGRAMS.map((p) => <button key={p.key} className={`pr-tab ${p.key === pk ? 'on' : ''}`} onClick={() => setPk(p.key)}>{p.label}</button>)}
      </div>
      <div className="ps-n">
        <span className="qg-label">n =</span>
        {[6, 10, 16].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => setN(v)}>{v}</button>)}
        <button className={`tt-preset ${dup ? 'on' : ''}`} onClick={() => setDup(!dup)}>{dup ? 'فيه تكرار' : 'دون تكرار'}</button>
        <button className="tt-preset" onClick={() => setSeed(seed + 1)}>🎲 مدخل آخر</button>
      </div>

      <div className="ram-mem" dir="ltr">
        <div className="ram-label">A</div>
        <div className="ram-cells">
          {A.map((v, i) => (
            <div key={i} className={`ram-cell ${fr.readA.includes(i) ? 'read' : ''} ${fr.vars.i === i ? 'pi' : ''} ${fr.vars.j === i ? 'pj' : ''}`}>
              <span className="ram-v">{v}</span>
              <span className="ram-addr">{i}</span>
            </div>
          ))}
        </div>
      </div>
      {P.usesTable && fr.T && (
        <div className="ram-mem" dir="ltr">
          <div className="ram-label">T</div>
          <div className="ram-cells small">
            {fr.T.slice(1).map((v, k) => (
              <div key={k} className={`ram-cell ${v ? 'set' : ''} ${fr.readT.includes(k + 1) ? 'read' : ''} ${fr.writeT.includes(k + 1) ? 'write' : ''}`}>
                <span className="ram-v">{v}</span>
                <span className="ram-addr">{k + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tt-side">
        <Pseudocode lines={P.pseudo} active={fr.line} />
        <div className="tt-info">
          <div className="ram-vars" dir="ltr">
            {Object.entries(fr.vars).map(([k, v]) => <span key={k}><i>{k}</i> = <b>{v}</b></span>)}
          </div>
          <div className="tt-counters">
            <span>الخطوات حتى الآن: <b className="ltr">{fr.steps}</b></span>
            <span>المجموع لهذا المدخل: <b className="ltr">{total}</b></span>
            <span>أسوأ حالة: <b className="ltr">{P.worst}</b></span>
          </div>
          {fr.done && <div className={`tt-verdict ${fr.done.startsWith('TRUE') ? 'v-T' : 'v-S'}`}><strong className="ltr">{fr.done.split(':')[0]}</strong>{fr.done.includes(':') ? <span>: {fr.done.split(':').slice(1).join(':')}</span> : null}</div>}
        </div>
      </div>
      <Player s={s} />
    </div>
  );
}

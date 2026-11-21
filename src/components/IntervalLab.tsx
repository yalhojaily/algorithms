import { useMemo, useState } from 'react';
import { PRESETS, RULE_AR, depth, greedyFrames, optimum, partitionFrames, type GFrame, type Iv, type PFrame, type Rule } from '../lib/intervals';
import { mulberry32 } from '../lib/montecarlo';
import { Player, record, useStepper } from '../engine/stepper';

const RULES: Rule[] = ['start', 'short', 'conflicts', 'finish'];
const COLORS = ['var(--blue)', 'var(--green)', 'var(--amber)', 'var(--violet)', 'var(--red)', 'var(--brand)'];

const randomIv = (seed: number, n: number, T: number): Iv[] => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => { const s = Math.floor(r() * (T - 4)); return { s, f: Math.min(T, s + 2 + Math.floor(r() * 9)) }; });
};

function Axis({ T, W, y }: { T: number; W: number; y: number }) {
  const ticks = Array.from({ length: Math.floor(T / 5) + 1 }, (_, i) => i * 5);
  return <g>{ticks.map((t) => <g key={t}><line x1={(t / T) * W} x2={(t / T) * W} y1={0} y2={y} className="iv-grid" /><text x={(t / T) * W} y={y + 12} textAnchor="middle" className="iv-tick">{t}</text></g>)}</g>;
}

function Select() {
  const [rule, setRule] = useState<Rule>('finish');
  const [preset, setPreset] = useState<string>('random');
  const [seed, setSeed] = useState(4);
  const I = useMemo(() => (preset === 'random' ? randomIv(seed, 12, 40) : PRESETS[preset].I), [preset, seed]);
  const frames = useMemo(() => record(greedyFrames(I, rule)), [I, rule]);
  const s = useStepper<GFrame>(frames, 1.5);
  const f = s.frame;
  const T = Math.max(...I.map((x) => x.f), 20);
  const order = I.map((_, i) => i).sort((a, b) => I[a].s - I[b].s || I[a].f - I[b].f);
  const W = 520, RH = 18, H = order.length * RH + 8;
  const opt = optimum(I);
  const st = (i: number) => (i === f.cur ? 'cur' : f.chosen.includes(i) ? 'ok' : f.rejected.includes(i) ? 'no' : '');
  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">القاعدة:</span>
        {RULES.map((r) => <button key={r} className={`tt-preset ${r === rule ? 'on' : ''}`} onClick={() => setRule(r)}>{RULE_AR[r]}</button>)}
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">المدخل:</span>
        {Object.entries(PRESETS).map(([k, p]) => <button key={k} className={`tt-preset ${k === preset ? 'on' : ''}`} onClick={() => setPreset(k)}>{p.label}</button>)}
        <button className={`tt-preset ${preset === 'random' ? 'on' : ''}`} onClick={() => { setPreset('random'); setSeed(seed + 1); }}>عشوائية 🎲</button>
      </div>
      <svg className="iv-svg" viewBox={`-6 -4 ${W + 12} ${H + 18}`} direction="ltr">
        <Axis T={T} W={W} y={H} />
        {order.map((i, row) => (
          <rect key={i} x={(I[i].s / T) * W} y={row * RH + 4} width={((I[i].f - I[i].s) / T) * W} height={RH - 6} rx={4} className={`iv-bar ${st(i)}`} />
        ))}
      </svg>
      <div className="gc-legend">
        <span className="gc-key ar"><i className="iv-sw ok" /> مختارة</span>
        <span className="gc-key ar"><i className="iv-sw no" /> محذوفة لأنها تتعارض</span>
        <span className="gc-key ar"><i className="iv-sw cur" /> اختيرت الآن</span>
      </div>
      <div className="da-stats">
        <span>اختارت القاعدة: <b className="ltr">{f.chosen.length}</b></span>
        <span>الأمثل: <b className="ltr">{opt}</b></span>
      </div>
      <div className={`inv-banner ${f.done ? (f.chosen.length === opt ? 'sq-ok' : 'sq-bad') : 'on'}`}>{f.note}{f.done && f.chosen.length < opt ? `، والأمثل ${opt}. هذه القاعدة خاطئة.` : ''}</div>
      <Player s={s} />
    </>
  );
}

function Rooms() {
  const [seed, setSeed] = useState(7);
  const I = useMemo(() => randomIv(seed, 14, 40), [seed]);
  const frames = useMemo(() => record(partitionFrames(I)), [I]);
  const s = useStepper<PFrame>(frames, 1.5);
  const f = s.frame;
  const total = frames[frames.length - 1].rooms;
  const W = 520, RH = 26, H = Math.max(total, 1) * RH + 8;
  const d = depth(I);
  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <button className="tt-preset" onClick={() => setSeed(seed + 1)}>محاضرات جديدة 🎲</button>
      </div>
      <div className="vm-help">كل محاضرة يجب أن تأخذ قاعة لا تتعارض فيها مع غيرها. كم قاعة نحتاج على الأقل؟</div>
      <svg className="iv-svg" viewBox={`-6 -4 ${W + 12} ${H + 18}`} direction="ltr">
        <Axis T={40} W={W} y={H} />
        {Array.from({ length: f.rooms }, (_, r) => <rect key={`l${r}`} x={0} y={r * RH + 2} width={W} height={RH - 2} className="iv-lane" />)}
        {I.map((x, i) => f.room[i] >= 0 && (
          <rect key={i} x={(x.s / 40) * W} y={f.room[i] * RH + 5} width={((x.f - x.s) / 40) * W} height={RH - 8} rx={4}
            style={{ fill: COLORS[f.room[i] % COLORS.length] }} className={`iv-room ${i === f.cur ? 'cur' : ''}`} />
        ))}
      </svg>
      <div className="da-stats">
        <span>القاعات المفتوحة: <b className="ltr">{f.rooms}</b></span>
        <span>العمق (أكبر تداخل): <b className="ltr">{d}</b></span>
      </div>
      <div className={`inv-banner ${f.done ? 'sq-ok' : 'on'}`}>{f.note}</div>
      <Player s={s} />
    </>
  );
}

/** Greedy interval scheduling: four candidate rules against tailored counterexamples, and interval partitioning. */
export default function IntervalLab() {
  const [tab, setTab] = useState<'sel' | 'rooms'>('sel');
  return (
    <div className="widget card iv">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">أي قاعدة جشعة صحيحة؟</span>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${tab === 'sel' ? 'on' : ''}`} onClick={() => setTab('sel')}>أكبر عدد من الفترات</button>
        <button className={`pr-tab ${tab === 'rooms' ? 'on' : ''}`} onClick={() => setTab('rooms')}>توزيع على القاعات</button>
      </div>
      {tab === 'sel' ? <Select /> : <Rooms />}
    </div>
  );
}

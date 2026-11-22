import { useMemo, useState } from 'react';
import { BOOK3, BOOK4, galeShapley, randomPrefs, unstablePairs, type GSFrame, type Prefs } from '../lib/greedy';
import { Player, useStepper } from '../engine/stepper';

const NAME: Record<string, string> = { A: 'Arkham', B: 'Bedlam', C: 'County', D: 'Dharma', q: 'Quincy', r: 'Rotwang', s: 'Shephard', t: 'Tam' };

/** Gale–Shapley step by step (either side proposing), and a checker for arbitrary matchings. */
export default function StableMatchLab() {
  const [tab, setTab] = useState<'gs' | 'check'>('gs');
  return (
    <div className="widget card sml">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">المطابقة المستقرة</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <button className={`tt-preset ${tab === 'gs' ? 'on' : ''}`} onClick={() => setTab('gs')}>خوارزمية Gale-Shapley</button>
        <button className={`tt-preset ${tab === 'check' ? 'on' : ''}`} onClick={() => setTab('check')}>افحص مطابقة بنفسك</button>
      </div>
      {tab === 'gs' ? <GS /> : <Check />}
    </div>
  );
}

function PrefTable({ p, side, f }: { p: Prefs; side: 'H' | 'D'; f: GSFrame }) {
  const rows = side === 'H' ? p.H : p.D, prefs = side === 'H' ? p.hpref : p.dpref;
  // who holds whom: f.match is receiver → proposer; normalise to hospital → doctor
  return (
    <table className="sml-tab" dir="ltr">
      <tbody>
        {rows.map((x, i) => (
          <tr key={x} className={f.proposer === x ? 'prop' : f.target === x ? 'recv' : ''}>
            <th title={NAME[x]}>{x}</th>
            {prefs[i].map((y) => {
              const paired = f.match[x] === y || f.match[y] === x;
              return <td key={y} className={`${paired ? 'pair' : ''} ${(f.proposer === x && f.target === y) || (f.proposer === y && f.target === x) ? 'now' : ''}`}>{y}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GS() {
  const [preset, setPreset] = useState<'book' | 'rand'>('book');
  const [seed, setSeed] = useState(4);
  const [side, setSide] = useState<'H' | 'D'>('H');
  const p = preset === 'book' ? BOOK4 : randomPrefs(5, seed);
  const run = useMemo(() => galeShapley(p, side, preset === 'book' && side === 'H'), [preset, seed, side]);
  const s = useStepper<GSFrame>(run.frames, 1.5);
  const f = s.frame;
  const done = f.result === 'done';
  const unstable = done ? unstablePairs(p, run.matching) : [];
  const prop = side === 'H' ? 'المستشفى' : 'الطبيبة', recv = side === 'H' ? 'الطبيبة' : 'المستشفى';
  return (
    <>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <button className={`tt-preset ${preset === 'book' ? 'on' : ''}`} onClick={() => setPreset('book')}>مثال الكتاب 4×4</button>
        <button className={`tt-preset ${preset === 'rand' ? 'on' : ''}`} onClick={() => { setPreset('rand'); setSeed(seed + 1); }}>تفضيلات عشوائية 5×5</button>
        <span className="qg-label">يعرض:</span>
        <button className={`tt-preset ${side === 'H' ? 'on' : ''}`} onClick={() => setSide('H')}>المستشفيات</button>
        <button className={`tt-preset ${side === 'D' ? 'on' : ''}`} onClick={() => setSide('D')}>الأطباء</button>
      </div>
      <div className="sml-cols">
        <div><div className="sml-h">المستشفيات وتفضيلاتها</div><PrefTable p={p} side="H" f={f} /></div>
        <div><div className="sml-h">الأطباء وتفضيلاتهم</div><PrefTable p={p} side="D" f={f} /></div>
      </div>
      <div className="edl-msg">
        {f.result === 'start' && <>كل {prop} يبدأ من رأس قائمته. والمطابقات كلها مؤقتة.</>}
        {f.result === 'accept' && <><b className="ltr">{f.proposer}</b> يعرض على <b className="ltr">{f.target}</b>، و{recv} بلا عرض بعد: تقبل مؤقتًا.</>}
        {f.result === 'switch' && <><b className="ltr">{f.proposer}</b> يعرض على <b className="ltr">{f.target}</b>، وهي تفضّله على <b className="ltr">{f.dumped}</b>: ترفض القديم وتقبل الجديد.</>}
        {f.result === 'reject' && <><b className="ltr">{f.proposer}</b> يعرض على <b className="ltr">{f.target}</b>، وهي تفضّل من معها الآن: ترفض.</>}
        {done && <>المطابقة النهائية: <bdi dir="ltr">{Object.entries(run.matching).sort().map(([h, d]) => h + d).join(', ')}</bdi>. أزواج غير مستقرة: <b>{unstable.length ? unstable.map(([d, h]) => `(${d}, ${h})`).join(' ') : 'لا شيء: مستقرة'}</b>.</>}
      </div>
      <div className="da-stats">
        <span>العروض: <b className="ltr">{Math.max(0, run.frames.indexOf(f) - (done ? 1 : 0))}</b> من <b className="ltr">{run.offers}</b> · الحد الأعلى <bdi dir="ltr">n² = {p.H.length ** 2}</bdi></span>
      </div>
      <div className="vm-help">الخلية الملونة في كل صف: الشريك المؤقت الحالي. والمؤطرة: العرض الذي يحدث الآن. جرّب تبديل الجهة التي تعرض على التفضيلات العشوائية: قد تتغير المطابقة، وكل جهة تحصل على أفضل مطابقة مستقرة لها.</div>
      <Player s={s} />
    </>
  );
}

function Check() {
  const p = BOOK3;
  const [m, setM] = useState<Record<string, string>>({ A: 'q', B: 'r', C: 's' });
  const [hist, setHist] = useState<string[]>(['Aq, Br, Cs']);
  const dup = new Set(Object.values(m)).size !== p.H.length;
  const u = dup ? [] : unstablePairs(p, m);
  const label = (mm: Record<string, string>) => p.H.map((h) => h + mm[h]).join(', ');
  const resolve = ([d, h]: [string, string]) => {
    // h takes d; d's old hospital takes h's old doctor
    const oldH = Object.keys(m).find((x) => m[x] === d)!, oldD = m[h];
    const nm = { ...m, [h]: d, [oldH]: oldD };
    setM(nm);
    setHist([...hist, label(nm)]);
  };
  return (
    <>
      <div className="sml-cols">
        <div><div className="sml-h">المستشفيات (مثال «أفكار سيئة» في الكتاب)</div>
          <table className="sml-tab" dir="ltr"><tbody>{p.H.map((h, i) => <tr key={h}><th>{h}</th>{p.hpref[i].map((d) => <td key={d} className={m[h] === d ? 'pair' : ''}>{d}</td>)}</tr>)}</tbody></table>
        </div>
        <div><div className="sml-h">الأطباء</div>
          <table className="sml-tab" dir="ltr"><tbody>{p.D.map((d, i) => <tr key={d}><th>{d}</th>{p.dpref[i].map((h) => <td key={h} className={m[h] === d ? 'pair' : ''}>{h}</td>)}</tr>)}</tbody></table>
        </div>
      </div>
      <div className="sml-pick" dir="ltr">
        {p.H.map((h) => (
          <label key={h}>{h} ←
            <select value={m[h]} onChange={(e) => { const nm = { ...m, [h]: e.target.value }; setM(nm); setHist([label(nm)]); }}>
              {p.D.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="edl-msg">
        {dup ? 'طبيب واحد مع مستشفيين: هذه ليست مطابقة.'
          : u.length ? <>أزواج غير مستقرة (كل منهما يفضّل الآخر على شريكه): {u.map((pr) => <button key={pr.join()} className="tt-preset" onClick={() => resolve(pr)}><bdi dir="ltr">({pr[0]}, {pr[1]})</bdi> أصلحه</button>)}</>
          : <b>المطابقة مستقرة.</b>}
      </div>
      <div className="sml-hist" dir="ltr">{hist.map((x, i) => <span key={i}>{i ? ' → ' : ''}{`{${x}}`}</span>)}</div>
      <div className="vm-help">«أصلحه» يجعل الزوج غير المستقر شريكين، ويعطي شريكيهما القديمين أحدهما للآخر. ابدأ من <bdi dir="ltr">{'{Aq, Br, Cs}'}</bdi> وأصلح بالترتيب <bdi dir="ltr">(r, A) ثم (r, C) ثم (q, C) ثم (q, A)</bdi>: تعود إلى البداية. هذه دورة Knuth في الكتاب.</div>
    </>
  );
}

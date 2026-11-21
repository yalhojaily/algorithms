import { useMemo, useState } from 'react';
import { chainBuild, makeHash, poisson, type HashKind, type Key } from '../lib/hashing';
import { mulberry32 } from '../lib/montecarlo';

const WORDS = 'cat dog sun moon star tree rock bird fish lamp door book milk salt rice tea coffee bread apple grape lemon olive date fig honey ink pen cup jar box key map ring sand wave wind snow rain fire clay iron gold silk wool rose mint sage thyme corn bean'.split(' ');

type KeySet = 'random' | 'mult' | 'words' | 'thousands';
const SETS: { k: KeySet; label: string }[] = [
  { k: 'random', label: 'أعداد عشوائية' },
  { k: 'mult', label: 'مضاعفات 16' },
  { k: 'thousands', label: 'أعداد متقاربة' },
  { k: 'words', label: 'كلمات' },
];
const HASHES: { k: HashKind; label: string }[] = [
  { k: 'mod', label: 'h(k) = k mod m' },
  { k: 'universal', label: 'شاملة: ((ak + b) mod p) mod m' },
  { k: 'first', label: 'سيئة: الحرف الأول / الآلاف' },
];

function makeKeys(set: KeySet, n: number, seed: number): Key[] {
  const r = mulberry32(seed);
  if (set === 'mult') return Array.from({ length: n }, (_, i) => 16 * (i + 1));
  if (set === 'thousands') return Array.from({ length: n }, (_, i) => 5000 + i * 7 + Math.floor(r() * 3));
  if (set === 'words') return WORDS.slice(0, Math.min(n, WORDS.length));
  return Array.from({ length: n }, () => Math.floor(r() * 100000));
}

/** Chaining: which bucket each key lands in, chain lengths, and how they compare with the ideal. */
export default function HashChainLab() {
  const [set, setSet] = useState<KeySet>('random');
  const [kind, setKind] = useState<HashKind>('universal');
  const [n, setN] = useState(24);
  const [m0, setM] = useState(16);
  const [grow, setGrow] = useState(false);
  const [seed, setSeed] = useState(5);
  const fn = useMemo(() => makeHash(kind, seed), [kind, seed]);
  const keys = useMemo(() => makeKeys(set, n, seed + 100), [set, n, seed]);
  const t = useMemo(() => chainBuild(keys, m0, fn, grow), [keys, m0, fn, grow]);
  const alpha = t.n / t.m;
  const lens = t.buckets.map((b) => b.length);
  const longest = Math.max(...lens);
  const avgSearch = t.n ? t.buckets.reduce((s, b) => s + (b.length * (b.length + 1)) / 2, 0) / t.n : 0;
  const hist = Array.from({ length: Math.max(longest + 1, 5) }, (_, j) => lens.filter((l) => l === j).length);
  const showRows = t.m <= 32;

  return (
    <div className="widget card hc">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">جدول تجزئة بالسلاسل</span>
      </div>
      <div className="rel-tabs" style={{ flexWrap: 'wrap' }}>
        {HASHES.map((h) => <button key={h.k} className={`pr-tab ${h.k === kind ? 'on' : ''}`} onClick={() => setKind(h.k)}><span dir="ltr">{h.label}</span></button>)}
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">المفاتيح:</span>
        {SETS.map((s) => <button key={s.k} className={`tt-preset ${s.k === set ? 'on' : ''}`} onClick={() => setSet(s.k)}>{s.label}</button>)}
        <button className="tt-preset" onClick={() => setSeed(seed + 1)} title="بذرة جديدة: مفاتيح ودالة شاملة جديدتان">🎲</button>
      </div>
      <div className="ap-sliders">
        <label><span className="ltr">n = <b>{n}</b></span><input type="range" min={1} max={set === 'words' ? WORDS.length : 128} value={Math.min(n, set === 'words' ? WORDS.length : 128)} onChange={(e) => setN(+e.target.value)} /></label>
        <label><span className="ltr">m = <b>{m0}</b></span><input type="range" min={0} max={4} value={Math.log2(m0) - 2} onChange={(e) => setM(2 ** (+e.target.value + 2))} /></label>
        <label className="ml-k"><input type="checkbox" checked={grow} onChange={(e) => setGrow(e.target.checked)} /> <span>ضاعف m وأعد التجزئة حين يصبح n &gt; m</span></label>
      </div>

      <div className="da-stats">
        <div><span>n</span><b>{t.n}</b></div>
        <div><span>m</span><b>{t.m}</b></div>
        <div><span>معامل التحميل α = n/m</span><b>{alpha.toFixed(2)}</b></div>
        <div><span>أطول سلسلة</span><b>{longest}</b></div>
        <div><span>متوسط المقارنات لإيجاد مفتاح موجود</span><b>{avgSearch.toFixed(2)}</b></div>
        <div><span>المتوقع ≈ 1 + α/2</span><b>{(1 + alpha / 2).toFixed(2)}</b></div>
        {grow && <div><span>مرات إعادة التجزئة</span><b>{t.rehashes}</b></div>}
      </div>

      {showRows ? (
        <div className="hc-table" dir="ltr">
          {t.buckets.map((b, i) => (
            <div key={i} className={`hc-row ${b.length === longest && longest > 1 ? 'hot' : ''}`}>
              <span className="hc-i">{i}</span>
              <span className="hc-chain">{b.map((k, j) => <i key={j}>{String(k)}</i>)}{b.length === 0 && <em>∅</em>}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="vm-help">الجدول كبير؛ انظر إلى توزيع أطوال السلاسل.</div>
      )}

      <div className="ct-dom-title">كم دلوًا طول سلسلته j؟ (الأعمدة: المرصود، النقاط: المتوقع مع تجزئة عشوائية)</div>
      <div className="hc-hist" dir="ltr">
        {hist.map((c, j) => {
          const exp = t.m * poisson(alpha, j);
          const top = Math.max(...hist, t.m * poisson(alpha, Math.floor(alpha)), 1);
          return (
            <div key={j} className="hc-col">
              <div className="hc-bar"><i style={{ height: `${(c / top) * 100}%` }} /><b style={{ bottom: `${(exp / top) * 100}%` }} /></div>
              <span>{j}</span>
            </div>
          );
        })}
      </div>
      <div className="vm-help">
        {kind === 'mod' && set === 'mult' && 'كل المفاتيح مضاعفات 16، وm قوة لـ 2 تقسم 16 أو تساويها: كلها تسقط في الدلو 0. الدالة k mod m تنظر إلى البتات الأخيرة فقط.'}
        {kind === 'first' && 'دالة سيئة: تعتمد على جزء صغير من المفتاح، فالمفاتيح المتشابهة تتكدس.'}
        {kind === 'universal' && 'الدالة الشاملة تختار a وb عشوائيًا مرة واحدة، فتتوزع حتى المفاتيح ذات النمط، والأطوال قريبة من المتوقع.'}
      </div>
    </div>
  );
}

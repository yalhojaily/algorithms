import { useId, useMemo, useRef, useState } from 'react';
import { member, parseSet, REGIONS, SetParseError, showSet, usesC, type SetExpr } from '../lib/sets';
import { Tex } from './MathText';

const N = 12;
const UNIV = Array.from({ length: N }, (_, i) => i + 1);
type Mem = { A: number[]; B: number[]; C: number[] };

const SET_PRESETS: { label: string; m: Mem; desc: string }[] = [
  { label: 'زوجي · مضاعفات 3 · أولي', m: { A: [2, 4, 6, 8, 10, 12], B: [3, 6, 9, 12], C: [2, 3, 5, 7, 11] }, desc: 'A الأعداد الزوجية، B مضاعفات 3، C الأعداد الأولية' },
  { label: 'فترات متداخلة', m: { A: [1, 2, 3, 4, 5, 6], B: [4, 5, 6, 7, 8, 9], C: [1, 3, 5, 7, 9, 11] }, desc: 'A = {1..6}، B = {4..9}، C الأعداد الفردية' },
  { label: 'B ⊆ A', m: { A: [1, 2, 3, 4, 5, 6, 7, 8], B: [2, 4, 6], C: [6, 7, 8, 9, 10] }, desc: 'B مجموعة جزئية من A' },
];

const EXPRS = ['A ∪ B', 'A ∩ B', 'A − B', 'A Δ B', '(A ∪ B)ᶜ', 'A ∩ (B ∪ C)', 'A ∪ B ∩ C', 'A − (B − C)'];
const KEYS = ['∪', '∩', '−', 'Δ', 'ᶜ', '(', ')', 'A', 'B', 'C', 'U', '∅'];

// Geometry for three circles and for two.
const G3 = {
  A: { x: 155, y: 125, r: 80 }, B: { x: 245, y: 125, r: 80 }, C: { x: 200, y: 200, r: 80 },
  anchors: { 'TTT': [200, 150], 'TTF': [200, 82], 'TFT': [150, 190], 'TFF': [118, 100], 'FTT': [250, 190], 'FTF': [282, 100], 'FFT': [200, 255] } as Record<string, [number, number]>,
};
const G2 = {
  A: { x: 160, y: 150, r: 100 }, B: { x: 240, y: 150, r: 100 }, C: { x: 0, y: 0, r: 0 },
  anchors: { 'TT': [200, 150], 'TF': [112, 150], 'FT': [288, 150] } as Record<string, [number, number]>,
};
const OFFS: [number, number][] = [[0, 0], [21, 0], [-21, 0], [0, 21], [0, -21], [21, 21], [-21, 21], [21, -21], [-21, -21], [42, 0], [-42, 0], [0, 42]];

function safe(src: string): SetExpr | string {
  try { return parseSet(src); } catch (e) { if (e instanceof SetParseError) return e.message; throw e; }
}

function ExprInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const insert = (k: string) => {
    const el = ref.current;
    const a = el?.selectionStart ?? value.length;
    const z = el?.selectionEnd ?? value.length;
    onChange(value.slice(0, a) + k + value.slice(z));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(a + k.length, a + k.length); });
  };
  return (
    <div>
      <label className="tt-label">{label}</label>
      <input ref={ref} className={`tt-input ${typeof safe(value) === 'string' ? 'bad' : ''}`} dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} autoComplete="off" />
      <div className="tt-keys" dir="ltr">
        {KEYS.map((k) => <button key={k} className="tt-key" onClick={() => insert(k)}>{k}</button>)}
      </div>
    </div>
  );
}

/** Build sets A, B, C inside U = {1..12}, type any set expression, and see it shaded on a Venn diagram. */
export default function VennLab() {
  const uid = useId().replace(/:/g, '');
  const [m, setM] = useState<Mem>(SET_PRESETS[0].m);
  const [src, setSrc] = useState('A ∩ (B ∪ C)');
  const [cmp, setCmp] = useState('(A ∩ B) ∪ (A ∩ C)');
  const [showCmp, setShowCmp] = useState(false);

  const e1 = useMemo(() => safe(src), [src]);
  const e2 = useMemo(() => safe(cmp), [cmp]);
  const ok1 = typeof e1 !== 'string';
  const ok2 = typeof e2 !== 'string';
  const three = (ok1 && usesC(e1 as SetExpr)) || (showCmp && ok2 && usesC(e2 as SetExpr));
  const G = three ? G3 : G2;

  const inA = (x: number) => m.A.includes(x);
  const inB = (x: number) => m.B.includes(x);
  const inC = (x: number) => three && m.C.includes(x);
  const res = (e: SetExpr, x: number) => member(e, inA(x), inB(x), inC(x));
  const result = ok1 ? UNIV.filter((x) => res(e1 as SetExpr, x)) : [];
  const result2 = showCmp && ok2 ? UNIV.filter((x) => res(e2 as SetExpr, x)) : [];
  const regions = three ? REGIONS : REGIONS.filter(([, , c]) => !c);

  const toggle = (S: 'A' | 'B' | 'C', x: number) =>
    setM((cur) => ({ ...cur, [S]: cur[S].includes(x) ? cur[S].filter((y) => y !== x) : [...cur[S], x].sort((a, b) => a - b) }));

  // place elements in their regions
  const key = (x: number) => (three ? `${inA(x) ? 'T' : 'F'}${inB(x) ? 'T' : 'F'}${inC(x) ? 'T' : 'F'}` : `${inA(x) ? 'T' : 'F'}${inB(x) ? 'T' : 'F'}`);
  const counts: Record<string, number> = {};
  let outside = 0;
  const pos = UNIV.map((x) => {
    const k = key(x);
    const anchor = G.anchors[k];
    if (!anchor) {
      const j = outside++;
      return [j < 12 ? 24 : 376, 26 + (j % 12) * 22] as [number, number];
    }
    const j = (counts[k] = (counts[k] ?? -1) + 1);
    const [dx, dy] = OFFS[j % OFFS.length];
    return [anchor[0] + dx, anchor[1] + dy] as [number, number];
  });

  const regionPath = (r: [boolean, boolean, boolean], fill: string, k: number) => {
    const [a, b, c] = r;
    let node = <rect x="6" y="6" width="388" height="288" fill={fill} />;
    if (three) node = <g mask={c ? undefined : `url(#${uid}nC)`} clipPath={c ? `url(#${uid}cC)` : undefined}>{node}</g>;
    node = <g mask={b ? undefined : `url(#${uid}nB)`} clipPath={b ? `url(#${uid}cB)` : undefined}>{node}</g>;
    node = <g key={k} mask={a ? undefined : `url(#${uid}nA)`} clipPath={a ? `url(#${uid}cA)` : undefined}>{node}</g>;
    return node;
  };

  const sameHere = ok1 && ok2 && JSON.stringify(result) === JSON.stringify(result2);
  const firstDiff = ok1 && ok2 ? regions.find(([a, b, c]) => member(e1 as SetExpr, a, b, c) !== member(e2 as SetExpr, a, b, c)) : undefined;
  const regionName = ([a, b, c]: [boolean, boolean, boolean]) =>
    [a ? 'في A' : 'ليس في A', b ? 'في B' : 'ليس في B', ...(three ? [c ? 'في C' : 'ليس في C'] : [])].join('، ');

  return (
    <div className="widget card venn">
      <div className="widget-head">
        <span className="widget-kicker">المحاكاة</span>
        <span className="widget-title">مختبر Venn: ابنِ المجموعات، واكتب أي تعبير</span>
      </div>

      <div className="tt-presets">
        {SET_PRESETS.map((p) => <button key={p.label} className={`tt-preset ${p.m === m ? 'on' : ''}`} onClick={() => setM(p.m)}>{p.label}</button>)}
      </div>
      <div className="venn-members" dir="ltr">
        {(['A', 'B', 'C'] as const).map((S) => (
          <div key={S} className={`vm-row ${S === 'C' && !three ? 'dim' : ''}`}>
            <span className={`vm-name s${S}`}>{S}</span>
            {UNIV.map((x) => (
              <button key={x} className={`vm-chip ${m[S].includes(x) ? `on s${S}` : ''}`} onClick={() => toggle(S, x)} aria-pressed={m[S].includes(x)}>{x}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="vm-help">اضغط عددًا لتضيفه إلى المجموعة أو تحذفه منها. المجموعة الشاملة هي <span className="ltr">{'U = {1, …, 12}'}</span>.</div>

      <div className="venn-grid">
        <div>
          <ExprInput value={src} onChange={setSrc} label="التعبير:" />
          <div className="tt-presets" dir="ltr">
            {EXPRS.map((x) => <button key={x} className={`tt-preset ${x === src ? 'on' : ''}`} onClick={() => setSrc(x)}>{x}</button>)}
          </div>
          {ok1 ? (
            <div className="venn-result">
              <Tex>{`${showSet(e1 as SetExpr, true)} = \\{${result.join(', ')}\\}`}</Tex>
              <span className="tag">|·| = {result.length}</span>
            </div>
          ) : <div className="tt-error">⚠️ {e1 as string}</div>}
        </div>
        <svg viewBox="0 0 400 300" className="venn-svg" role="img" aria-label="مخطط Venn">
          <defs>
            {(['A', 'B', 'C'] as const).map((S) => (
              <g key={S}>
                <clipPath id={`${uid}c${S}`}><circle cx={G[S].x} cy={G[S].y} r={G[S].r} /></clipPath>
                <mask id={`${uid}n${S}`}><rect x="0" y="0" width="400" height="300" fill="white" /><circle cx={G[S].x} cy={G[S].y} r={G[S].r} fill="black" /></mask>
              </g>
            ))}
          </defs>
          <rect x="6" y="6" width="388" height="288" rx="14" className="venn-u" />
          {ok1 && regions.map((r, k) => (member(e1 as SetExpr, ...r) ? regionPath(r, 'var(--vf)', k) : null))}
          {(['A', 'B', ...(three ? ['C'] : [])] as ('A' | 'B' | 'C')[]).map((S) => (
            <g key={S}>
              <circle cx={G[S].x} cy={G[S].y} r={G[S].r} className={`venn-c s${S}`} />
              <text x={S === 'A' ? G[S].x - G[S].r * 0.72 : S === 'B' ? G[S].x + G[S].r * 0.72 : G[S].x + G[S].r * 0.8} y={S === 'C' ? G[S].y + G[S].r * 0.75 : G[S].y - G[S].r * 0.72} className={`venn-label s${S}`}>{S}</text>
            </g>
          ))}
          <text x="388" y="290" className="venn-label u" textAnchor="end">U</text>
          {UNIV.map((x, k) => (
            <g key={x} className={`venn-el ${ok1 && res(e1 as SetExpr, x) ? 'in' : ''}`}>
              <circle cx={pos[k][0]} cy={pos[k][1]} r="9.5" />
              <text x={pos[k][0]} y={pos[k][1] + 4} textAnchor="middle">{x}</text>
            </g>
          ))}
        </svg>
      </div>

      <label className="venn-cmp-toggle">
        <input type="checkbox" checked={showCmp} onChange={(e) => setShowCmp(e.target.checked)} /> قارن بتعبير ثانٍ: هل هما هوية؟
      </label>
      {showCmp && (
        <div className="venn-cmp">
          <ExprInput value={cmp} onChange={setCmp} label="التعبير الثاني:" />
          {ok1 && ok2 && (
            <>
              <div className="table-scroll" dir="ltr">
                <table className="nice tt">
                  <thead>
                    <tr><th>A</th><th>B</th>{three && <th>C</th>}<th><Tex>{showSet(e1 as SetExpr, true)}</Tex></th><th><Tex>{showSet(e2 as SetExpr, true)}</Tex></th></tr>
                  </thead>
                  <tbody>
                    {regions.map((r, k) => {
                      const x = member(e1 as SetExpr, ...r);
                      const y = member(e2 as SetExpr, ...r);
                      return (
                        <tr key={k} className={x !== y ? 'differ' : ''}>
                          <td>{r[0] ? '∈' : '∉'}</td><td>{r[1] ? '∈' : '∉'}</td>{three && <td>{r[2] ? '∈' : '∉'}</td>}
                          <td><span className={x ? 'T' : 'F'}>{x ? '∈' : '∉'}</span></td><td><span className={y ? 'T' : 'F'}>{y ? '∈' : '∉'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className={`tt-verdict ${firstDiff ? 'v-F' : 'v-T'}`}>
                {firstDiff ? (
                  <><strong>ليستا هوية.</strong> تختلفان في المنطقة: {regionName(firstDiff)}. {sameHere ? 'لاحظ أنهما متساويتان لهذه المجموعات بالذات، لأن تلك المنطقة فارغة الآن. لكنهما ليستا متساويتين دائمًا.' : 'وهما مختلفتان لهذه المجموعات أيضًا.'}</>
                ) : (
                  <><strong>هوية:</strong> متساويتان لكل المجموعات A وB{three ? ' وC' : ''} أيًّا كانت، لأنهما متساويتان في كل منطقة. هذا الجدول هو جدول الصدق نفسه الذي عرفته في الدرس 0.1.</>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

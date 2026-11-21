import { useMemo, useState } from 'react';
import { Tex } from './MathText';

const ROWS = 13;

/** Pascal's triangle: click a number to see the two numbers it is built from; or colour by parity. */
export default function PascalTriangle() {
  const T = useMemo(() => {
    const t: number[][] = [[1]];
    for (let n = 1; n < ROWS; n++) t.push(Array.from({ length: n + 1 }, (_, k) => (k === 0 || k === n ? 1 : t[n - 1][k - 1] + t[n - 1][k])));
    return t;
  }, []);
  const [sel, setSel] = useState<[number, number]>([6, 2]);
  const [mode, setMode] = useState<'pascal' | 'row' | 'parity'>('pascal');
  const [n, k] = sel;

  const cls = (r: number, c: number) => {
    if (mode === 'parity') return T[r][c] % 2 ? 'odd' : 'even';
    if (mode === 'row') return r === n ? 'row' : '';
    if (r === n && c === k) return 'sel';
    if (n > 0 && r === n - 1 && (c === k - 1 || c === k)) return 'par';
    return '';
  };

  return (
    <div className="widget card pt">
      <div className="widget-head">
        <span className="widget-kicker">جرّب بنفسك</span>
        <span className="widget-title">مثلث Pascal</span>
      </div>
      <div className="rel-tabs">
        <button className={`pr-tab ${mode === 'pascal' ? 'on' : ''}`} onClick={() => setMode('pascal')}>هوية Pascal</button>
        <button className={`pr-tab ${mode === 'row' ? 'on' : ''}`} onClick={() => setMode('row')}>مجموع الصف</button>
        <button className={`pr-tab ${mode === 'parity' ? 'on' : ''}`} onClick={() => setMode('parity')}>الزوجي والفردي</button>
      </div>
      <div className="pt-tri" dir="ltr">
        {T.map((row, r) => (
          <div key={r} className="pt-row">
            {row.map((v, c) => (
              <button key={c} className={`pt-cell ${cls(r, c)}`} onClick={() => setSel([r, c])} title={`C(${r}, ${c})`}>{v}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="pt-explain">
        {mode === 'pascal' && (n === 0 || k === 0 || k === n ? (
          <Tex>{`\\binom{${n}}{${k}} = 1`}</Tex>
        ) : (
          <Tex>{`\\binom{${n}}{${k}} = \\binom{${n - 1}}{${k - 1}} + \\binom{${n - 1}}{${k}} = ${T[n - 1][k - 1]} + ${T[n - 1][k]} = ${T[n][k]}`}</Tex>
        ))}
        {mode === 'row' && <Tex>{`\\sum_{k=0}^{${n}} \\binom{${n}}{k} = ${T[n].join(' + ')} = ${2 ** n} = 2^{${n}}`}</Tex>}
        {mode === 'parity' && <span>الأعداد الفردية ملوّنة. هل ترى مثلث Sierpiński؟</span>}
      </div>
    </div>
  );
}

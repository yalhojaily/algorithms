import type { Mat } from '../lib/apsp';

export const fmtW = (x: number) => (x === Infinity ? '∞' : x === -Infinity ? '−∞' : String(x));

/** A V × V matrix of distances with optional highlighting and click. */
export default function AMat({ M, names, cls, onClick, piv }: { M: Mat; names: string[]; cls?: (i: number, j: number) => string; onClick?: (i: number, j: number) => void; piv?: number }) {
  return (
    <div className="apm-wrap">
      <table className="apm-mat" dir="ltr">
        <thead><tr><th />{names.map((c, j) => <th key={j} className={j === piv ? 'piv' : ''}>{c}</th>)}</tr></thead>
        <tbody>{M.map((row, i) => (
          <tr key={i}><th className={i === piv ? 'piv' : ''}>{names[i]}</th>
            {row.map((x, j) => (
              <td key={j} onClick={() => onClick?.(i, j)}
                className={`${onClick ? 'click' : ''} ${x === Infinity ? 'inf' : x < 0 ? 'neg' : ''} ${i === piv || j === piv ? 'piv' : ''} ${cls?.(i, j) ?? ''}`}>{fmtW(x)}</td>
            ))}
          </tr>))}</tbody>
      </table>
    </div>
  );
}

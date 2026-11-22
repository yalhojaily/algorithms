import type { ReactNode } from 'react';

export interface GridCell { text: ReactNode; cls?: string }

/** A dynamic-programming table: row and column labels, and a renderer for every cell. Always LTR. */
export default function DPGrid({ rows, cols, cell, corner = '', rowTitle, colTitle, compact = false }: {
  rows: ReactNode[]; cols: ReactNode[]; cell: (r: number, c: number) => GridCell;
  corner?: ReactNode; rowTitle?: ReactNode; colTitle?: ReactNode; compact?: boolean;
}) {
  return (
    <div className={`dpg-wrap ${compact ? 'compact' : ''}`} dir="ltr">
      {colTitle && <div className="dpg-ct">{colTitle}</div>}
      <div className="dpg-row-wrap">
        {rowTitle && <div className="dpg-rt">{rowTitle}</div>}
        <table className="dpg">
          <thead><tr><th className="dpg-corner">{corner}</th>{cols.map((c, k) => <th key={k}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <th>{r}</th>
                {cols.map((_, j) => { const x = cell(i, j); return <td key={j} className={x.cls ?? ''}>{x.text}</td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

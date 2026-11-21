import { useMemo, useState } from 'react';
import { apply, makeSolver, moves, occupant, start, winner, type GMove, type GState, type Player } from '../lib/sugar';

const NAME: Record<Player, string> = { H: 'Horace (قطعه تتحرك يمينًا)', V: 'Vera (قطعها تتحرك إلى الأسفل)' };

/** Play the fake-sugar-packet game against PlayAnyGame, with every move marked good or bad. */
export default function SugarGameLab() {
  const [n, setN] = useState(3);
  const [first, setFirst] = useState<Player>('H');
  const [hist, setHist] = useState<GState[]>([start(3, 'H')]);
  const [hint, setHint] = useState(true);
  const solver = useMemo(() => makeSolver(), [n]);
  const s = hist[hist.length - 1];
  const w = winner(s);
  const ms = w ? [] : moves(s);
  const goodNow = solver.good(s);
  const verdict = (m: GMove | null) => !solver.good(apply(s, m));     // true = a good move (leads to a bad state)
  const reset = (nn = n, ff = first) => { setN(nn); setFirst(ff); setHist([start(nn, ff)]); };
  const play = (m: GMove | null) => setHist([...hist, apply(s, m)]);
  const best = () => {
    if (w) return;
    if (!ms.length) return play(null);
    play(ms.find((m) => verdict(m)) ?? ms[0]);
  };
  const N = n + 2;
  const moveAt = (row: number, col: number) => ms.find((m) => (s.turn === 'H' ? m.token === row - 1 && m.from === col : m.token === col - 1 && m.from === row));
  return (
    <div className="widget card sgm">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">لعبة أكياس السكر ضد PlayAnyGame</span>
      </div>
      <div className="ps-n" style={{ flexWrap: 'wrap' }}>
        <span className="qg-label">اللوح:</span>
        {[2, 3, 4].map((v) => <button key={v} className={`tt-preset ${v === n ? 'on' : ''}`} onClick={() => reset(v)}><bdi dir="ltr">{v}×{v}</bdi></button>)}
        <span className="qg-label">يبدأ:</span>
        {(['H', 'V'] as Player[]).map((p) => <button key={p} className={`tt-preset ${p === first ? 'on' : ''}`} onClick={() => reset(n, p)}>{p === 'H' ? 'Horace' : 'Vera'}</button>)}
      </div>
      <div className="sgm-body">
        <div className="sgm-board" dir="ltr" style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, gridTemplateRows: `repeat(${N}, 1fr)`, maxWidth: N * 44 }}>
          {Array.from({ length: N }, (_, row) => Array.from({ length: N }, (_, col) => {
            const interior = row >= 1 && row <= n && col >= 1 && col <= n;
            const hb = col === 0 && row >= 1 && row <= n, vb = row === 0 && col >= 1 && col <= n;
            const offH = col === n + 1 && row >= 1 && row <= n, offV = row === n + 1 && col >= 1 && col <= n;
            let tok: Player | null = null;
            if (interior) tok = occupant(s, row, col);
            if ((hb && s.h[row - 1] === 0) || (offH && s.h[row - 1] === n + 1)) tok = 'H';
            if ((vb && s.v[col - 1] === 0) || (offV && s.v[col - 1] === n + 1)) tok = 'V';
            const m = tok === s.turn ? moveAt(row, col) : undefined;
            const cls = interior ? 'in' : hb || vb ? 'border' : offH || offV ? 'off' : 'none';
            const g = m && hint ? (verdict(m) ? 'good' : 'bad') : '';
            return (
              <button key={`${row}-${col}`} className={`sgm-sq ${cls} ${m ? 'can' : ''} ${g}`} disabled={!m} onClick={() => m && play(m)}
                title={m ? (m.jump ? 'قفزة' : 'خطوة') : ''}>
                {tok && <span className={`sgm-tok ${tok}`}>{tok === 'H' ? '▶' : '▼'}</span>}
              </button>
            );
          }))}
        </div>
        <div className="sgm-side">
          {w ? (
            <div className={`sgm-ver ${w}`}>فاز {w === 'H' ? 'Horace' : 'Vera'}!</div>
          ) : (
            <>
              <div className="sgm-turn">الدور: <b>{NAME[s.turn]}</b></div>
              <div className={`sgm-ver ${goodNow ? 'good' : 'bad'}`}>هذه الحالة <b>{goodNow ? 'Good' : 'Bad'}</b> لمن عليه الدور{goodNow ? ': يستطيع الفوز مهما لعب خصمه' : ': سيخسر إن لعب خصمه بلا خطأ'}</div>
              {!ms.length && <button className="btn btn-sm" onClick={() => play(null)}>لا حركة متاحة: مرّر الدور</button>}
            </>
          )}
          <div className="sgm-btns">
            <button className="btn btn-sm btn-primary" disabled={!!w} onClick={best}>العب الحركة المثلى</button>
            <button className="btn btn-sm" disabled={hist.length < 2} onClick={() => setHist(hist.slice(0, -1))}>تراجع</button>
            <button className="btn btn-sm" onClick={() => reset()}>من جديد</button>
          </div>
          <label className="qn-chk"><input type="checkbox" checked={hint} onChange={(e) => setHint(e.target.checked)} /> لوّن الحركات: أخضر جيدة، أحمر سيئة</label>
          <div className="sgm-stat">حالات حللها البحث حتى الآن: <b className="ltr">{solver.states().toLocaleString('en')}</b></div>
        </div>
      </div>
      <div className="vm-help">اضغط على قطعة لاعب الدور لتحريكها. الحركة الجيدة (خضراء) تنقل خصمك إلى حالة Bad. ولاحظ أن القطعة تقفز فوق قطعة الخصم إن سدّت طريقها وكان بعدها مربع فارغ. البحث هنا يحفظ نتائج الحالات حتى لا يعيد حسابها، وهي فكرة الفصل التالي؛ أما المنطق فهو PlayAnyGame كما في الكتاب.</div>
    </div>
  );
}

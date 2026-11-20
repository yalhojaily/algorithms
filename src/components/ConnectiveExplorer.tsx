import { useState } from 'react';
import { Tex } from './MathText';

const CONNECTIVES: { tex: string; name: string; read: string; f: (p: boolean, q: boolean) => boolean; why: (p: boolean, q: boolean) => string }[] = [
  { tex: '\\lnot P', name: 'NOT', read: 'ليس P', f: (p) => !p, why: (p) => (p ? 'P صادقة، فنفيها كاذب.' : 'P كاذبة، فنفيها صادق.') },
  { tex: 'P \\land Q', name: 'AND', read: 'P و Q', f: (p, q) => p && q, why: (p, q) => (p && q ? 'كلتاهما صادقة.' : 'تكفي قضية كاذبة واحدة لتكذب الوصلة.') },
  { tex: 'P \\lor Q', name: 'OR', read: 'P أو Q', f: (p, q) => p || q, why: (p, q) => (p || q ? (p && q ? 'كلتاهما صادقة، و«أو» الرياضية تقبل ذلك.' : 'تكفي قضية صادقة واحدة.') : 'كلتاهما كاذبة.') },
  { tex: 'P \\oplus Q', name: 'XOR', read: 'إما P وإما Q', f: (p, q) => p !== q, why: (p, q) => (p !== q ? 'واحدة فقط صادقة.' : p ? 'كلتاهما صادقة، و«إما…وإما» تمنع ذلك.' : 'لا واحدة منهما صادقة.') },
  { tex: 'P \\rightarrow Q', name: 'IMPLIES', read: 'إذا P فإن Q', f: (p, q) => !p || q, why: (p, q) => (p ? (q ? 'وُعدنا بـ Q ووقعت: الوعد محفوظ.' : 'تحقق الشرط ولم تقع النتيجة: هذه الحالة الوحيدة التي يُنقض فيها الوعد.') : 'الشرط لم يتحقق، فالوعد لم يُنقض: صادقة «بانتفاء الشرط».') },
  { tex: 'P \\leftrightarrow Q', name: 'IFF', read: 'P إذا وفقط إذا Q', f: (p, q) => p === q, why: (p, q) => (p === q ? 'لهما القيمة نفسها.' : 'قيمتاهما مختلفتان.') },
];

function Toggle({ label, value, onChange, cls }: { label: string; value: boolean; onChange: (v: boolean) => void; cls: string }) {
  return (
    <button className={`tv-toggle ${value ? 'on' : 'off'}`} onClick={() => onChange(!value)} aria-pressed={value}>
      <span className={cls}>{label}</span>
      <span className="tv-val">{value ? 'T صادقة' : 'F كاذبة'}</span>
    </button>
  );
}

/** Flip P and Q and watch every connective respond, with the reason in words. */
export default function ConnectiveExplorer() {
  const [p, setP] = useState(true);
  const [q, setQ] = useState(false);
  return (
    <div className="widget card">
      <div className="widget-head">
        <span className="widget-kicker">جرّب بنفسك</span>
        <span className="widget-title">الروابط المنطقية الستة</span>
      </div>
      <div className="tv-toggles">
        <Toggle label="P" value={p} onChange={setP} cls="c-p" />
        <Toggle label="Q" value={q} onChange={setQ} cls="c-q" />
      </div>
      <div className="table-scroll">
        <table className="nice ce-table">
          <thead><tr><th>الصيغة</th><th>تُقرأ</th><th>القيمة</th><th>لماذا؟</th></tr></thead>
          <tbody>
            {CONNECTIVES.map((c) => {
              const v = c.f(p, q);
              return (
                <tr key={c.name}>
                  <td className="ce-f"><Tex>{c.tex}</Tex> <span className="en">{c.name}</span></td>
                  <td>{c.read}</td>
                  <td><span className={`tv-pill ${v ? 'T' : 'F'}`}>{v ? 'T' : 'F'}</span></td>
                  <td className="ce-why">{c.why(p, q)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

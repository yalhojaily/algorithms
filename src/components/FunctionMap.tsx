import { useState } from 'react';

const XS = ['a', 'b', 'c', 'd', 'e'];

/** Build f: X → Y by picking an arrow for each x; see injective / surjective / bijective live, with the reason. */
export default function FunctionMap() {
  const [nx, setNx] = useState(4);
  const [ny, setNy] = useState(4);
  const [f, setF] = useState<number[]>([0, 2, 1, 2, 3]);
  const [pick, setPick] = useState(0);

  const X = XS.slice(0, nx);
  const Y = Array.from({ length: ny }, (_, k) => k + 1);
  const fx = X.map((_, i) => Math.min(f[i] ?? 0, ny - 1));

  const pre = Y.map((_, y) => X.filter((_, i) => fx[i] === y));
  const collide = pre.findIndex((p) => p.length > 1);
  const missed = pre.findIndex((p) => p.length === 0);
  const inj = collide < 0;
  const sur = missed < 0;

  const H = 46 + Math.max(nx, ny) * 44;
  const yX = (i: number) => 40 + i * 44 + ((Math.max(nx, ny) - nx) * 44) / 2;
  const yY = (j: number) => 40 + j * 44 + ((Math.max(nx, ny) - ny) * 44) / 2;

  const setArrow = (j: number) => setF((cur) => cur.map((v, i) => (i === pick ? j : v)));

  return (
    <div className="widget card fm">
      <div className="widget-head">
        <span className="widget-kicker">جرّب بنفسك</span>
        <span className="widget-title">ابنِ دالة f: X → Y</span>
      </div>
      <div className="fm-sizes">
        <span>|X| =</span>{[2, 3, 4, 5].map((k) => <button key={k} className={`tt-preset ${k === nx ? 'on' : ''}`} onClick={() => { setNx(k); setPick(0); }}>{k}</button>)}
        <span>|Y| =</span>{[2, 3, 4, 5].map((k) => <button key={k} className={`tt-preset ${k === ny ? 'on' : ''}`} onClick={() => setNy(k)}>{k}</button>)}
      </div>
      <div className="vm-help">اختر عنصرًا من X (يسار المخطط)، ثم اختر صورته في Y (يمين المخطط).</div>
      <svg viewBox={`0 0 320 ${H}`} className="fm-svg" style={{ direction: "ltr" }}>
        <defs>
          <marker id="fm-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" className="fm-head" /></marker>
        </defs>
        <rect x="30" y="14" width="70" height={H - 28} rx="30" className="fm-blob" />
        <rect x="220" y="14" width="70" height={H - 28} rx="30" className="fm-blob" />
        <text x="65" y={H - 2} textAnchor="middle" className="fm-cap">X</text>
        <text x="255" y={H - 2} textAnchor="middle" className="fm-cap">Y</text>
        {X.map((_, i) => {
          const bad = collide >= 0 && fx[i] === collide;
          return <line key={i} x1="80" y1={yX(i)} x2="236" y2={yY(fx[i])} className={`fm-arrow ${bad ? 'bad' : ''} ${i === pick ? 'sel' : ''}`} markerEnd="url(#fm-arr)" />;
        })}
        {X.map((x, i) => (
          <g key={x} className={`fm-node ${i === pick ? 'sel' : ''}`} onClick={() => setPick(i)} style={{ cursor: 'pointer' }}>
            <circle cx="65" cy={yX(i)} r="15" />
            <text x="65" y={yX(i) + 5} textAnchor="middle">{x}</text>
          </g>
        ))}
        {Y.map((y, j) => (
          <g key={y} className={`fm-node y ${missed === j ? 'miss' : ''} ${collide === j ? 'coll' : ''}`} onClick={() => setArrow(j)} style={{ cursor: 'pointer' }}>
            <circle cx="255" cy={yY(j)} r="15" />
            <text x="255" y={yY(j) + 5} textAnchor="middle">{y}</text>
          </g>
        ))}
      </svg>
      <ul className="rel-props">
        <li className={inj ? 'ok' : 'bad'}>
          <span className="rel-mark">{inj ? '✓' : '✗'}</span>
          <span className="rel-pname">متباينة <span className="en">injective</span></span>
          <span className="rel-why">{inj ? 'لا يوجد عنصران في Y لهما الصورة نفسها.' : `العنصران ${pre[collide].slice(0, 2).map((x) => `\u2066${x}\u2069`).join(' و')} لهما الصورة نفسها ${collide + 1}.`}{nx > ny && ' ولا يمكن أن تكون متباينة أصلًا لأن |X| > |Y|: هذا مبدأ برج الحمام.'}</span>
        </li>
        <li className={sur ? 'ok' : 'bad'}>
          <span className="rel-mark">{sur ? '✓' : '✗'}</span>
          <span className="rel-pname">شاملة <span className="en">surjective</span></span>
          <span className="rel-why">{sur ? 'كل عنصر في Y صورة لعنصر ما.' : `العنصر ${missed + 1} ليس صورة لأي عنصر.`}{nx < ny && ' ولا يمكن أن تكون شاملة أصلًا لأن |X| < |Y|.'}</span>
        </li>
        <li className={inj && sur ? 'ok' : 'bad'}>
          <span className="rel-mark">{inj && sur ? '✓' : '✗'}</span>
          <span className="rel-pname">تقابل <span className="en">bijective</span></span>
          <span className="rel-why">{inj && sur ? 'متباينة وشاملة: لها دالة عكسية f⁻¹، اعكس الأسهم.' : 'ليس لها دالة عكسية.'}</span>
        </li>
      </ul>
    </div>
  );
}

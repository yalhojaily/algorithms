import { useMemo, useState } from 'react';
import { Player, useStepper } from '../engine/stepper';
import MixText from './MixText';

const STEPS = [
  { code: null, ar: 'المدخلات: أربع نقاط A وB وC وD. وحدة الطول هي |AB|.' },
  { code: 1, ar: 'α ← RightAngle(Line(A, C), A): العمود على AC من A.' },
  { code: 2, ar: 'E ← Intersect(Circle(A, B), α): ننقل الطول |AB| إلى α.' },
  { code: 3, ar: 'F ← Intersect(Circle(A, D), α): ننقل الطول |AD| إلى α.' },
  { code: 4, ar: 'β ← RightAngle(Line(E, C), F): العمود على EC من F.' },
  { code: 5, ar: 'γ ← RightAngle(β, F): العمود على β من F، أي الموازي لـ EC.' },
  { code: 6, ar: 'Z ← Intersect(γ, Line(A, C)). المثلثان ACE وAZF متشابهان، فـ |AZ| / |AF| = |AC| / |AE|.' },
];
const CODE = [
  'MultiplyOrDivide(A, B, C, D):',
  '  α ← RightAngle(Line(A, C), A)',
  '  E ← Intersect(Circle(A, B), α)',
  '  F ← Intersect(Circle(A, D), α)',
  '  β ← RightAngle(Line(E, C), F)',
  '  γ ← RightAngle(β, F)',
  '  return Intersect(γ, Line(A, C))',
];

/** Euclid's multiplication by compass and straightedge: |AZ| = |AC|·|AD| / |AB|. */
export default function CompassLab() {
  const [ab, setAb] = useState(1);
  const [ac, setAc] = useState(2);
  const [ad, setAd] = useState(1.5);
  const frames = useMemo(() => STEPS.map((_, i) => i), []);
  const s = useStepper<number>(frames, 0.7);
  const k = s.frame;
  const az = (ac * ad) / ab;
  // geometry in "units", then scaled into the SVG
  const W = 560, H = 300, pad = 34;
  const maxX = Math.max(az, ac, ad, ab) * 1.08, maxY = Math.max(ad, ab) * 1.15;
  const sc = Math.min((W - 2 * pad) / maxX, (H - 2 * pad) / maxY);
  const P = (x: number, y: number) => [pad + x * sc, H - pad - y * sc] as const;
  const [Ax, Ay] = P(0, 0), [Bx, By] = P(ab, 0), [Cx, Cy] = P(ac, 0), [Dx, Dy] = P(ad, 0);
  const [Ex, Ey] = P(0, ab), [Fx, Fy] = P(0, ad), [Zx, Zy] = P(az, 0);
  const arc = (r: number) => { const [x0, y0] = P(r, 0), [x1, y1] = P(0, r); return `M ${x0} ${y0} A ${r * sc} ${r * sc} 0 0 0 ${x1} ${y1}`; };
  // β: through F, perpendicular to EC. Direction of EC is (ac, -ab); perpendicular is (ab, ac).
  const bl = 0.9 * Math.max(ad, 1);
  const n = Math.hypot(ab, ac);
  const [b0x, b0y] = P(-(ab / n) * bl * 0.4, ad - (ac / n) * bl * 0.4), [b1x, b1y] = P((ab / n) * bl, ad + (ac / n) * bl);
  const pt = (x: number, y: number, label: string, cls = '', dx = 0, dy = -9) => (
    <g className={`geo-pt ${cls}`}><circle cx={x} cy={y} r={4} /><text x={x + dx} y={y + dy} textAnchor="middle">{label}</text></g>
  );
  return (
    <div className="widget card geo">
      <div className="widget-head">
        <span className="widget-kicker">المختبر التفاعلي</span>
        <span className="widget-title">الضرب بالفرجار والمسطرة</span>
      </div>
      <div className="ap-sliders">
        <label><span><bdi dir="ltr">|AB|</bdi> (الوحدة) = <b>{ab.toFixed(2)}</b></span><input type="range" min={0.5} max={2.5} step={0.05} value={ab} onChange={(e) => setAb(+e.target.value)} /></label>
        <label><span><bdi dir="ltr">|AC|</bdi> = <b>{ac.toFixed(2)}</b></span><input type="range" min={0.5} max={3} step={0.05} value={ac} onChange={(e) => setAc(+e.target.value)} /></label>
        <label><span><bdi dir="ltr">|AD|</bdi> = <b>{ad.toFixed(2)}</b></span><input type="range" min={0.5} max={3} step={0.05} value={ad} onChange={(e) => setAd(+e.target.value)} /></label>
      </div>
      <svg className="geo-svg" viewBox={`0 0 ${W} ${H}`} direction="ltr">
        <line x1={pad - 10} y1={Ay} x2={W - 8} y2={Ay} className="geo-line base" />
        {k >= 1 && <line x1={Ax} y1={H - 10} x2={Ax} y2={8} className="geo-line alpha" />}
        {k >= 1 && <text x={Ax + 8} y={16} className="geo-lbl">α</text>}
        {k >= 2 && <path d={arc(ab)} className="geo-arc" />}
        {k >= 3 && <path d={arc(ad)} className="geo-arc" />}
        {k >= 4 && <line x1={Ex} y1={Ey} x2={Cx} y2={Cy} className="geo-line ec" />}
        {k >= 4 && <line x1={b0x} y1={b0y} x2={b1x} y2={b1y} className="geo-line beta" />}
        {k >= 4 && <text x={b1x + 6} y={b1y + 4} className="geo-lbl">β</text>}
        {k >= 5 && <line x1={Fx} y1={Fy} x2={Zx + (Zx - Fx) * 0.08} y2={Zy + (Zy - Fy) * 0.08} className="geo-line gamma" />}
        {k >= 6 && <polygon points={`${Ax},${Ay} ${Cx},${Cy} ${Ex},${Ey}`} className="geo-tri small" />}
        {k >= 6 && <polygon points={`${Ax},${Ay} ${Zx},${Zy} ${Fx},${Fy}`} className="geo-tri big" />}
        {pt(Ax, Ay, 'A', '', -10, 16)}
        {pt(Bx, By, 'B', '', 0, 18)}
        {pt(Cx, Cy, 'C', '', 0, 18)}
        {pt(Dx, Dy, 'D', '', 0, 18)}
        {k >= 2 && pt(Ex, Ey, 'E', '', -13, 4)}
        {k >= 3 && pt(Fx, Fy, 'F', '', -13, 4)}
        {k >= 6 && pt(Zx, Zy, 'Z', 'z', 0, 18)}
      </svg>
      <div className="geo-step"><MixText text={STEPS[k].ar} /></div>
      <pre className="geo-code" dir="ltr">{CODE.map((l, i) => <div key={i} className={STEPS[k].code === i ? 'on' : ''}>{l}</div>)}</pre>
      <div className="da-stats">
        <span><bdi dir="ltr">|AC| · |AD| / |AB| = {ac.toFixed(2)} · {ad.toFixed(2)} / {ab.toFixed(2)} = {az.toFixed(3)}</bdi></span>
        {k >= 6 && <span>القيمة المقيسة <bdi dir="ltr">|AZ| = {(((Zx - Ax) / sc)).toFixed(3)}</bdi></span>}
      </div>
      <div className="vm-help">حرّك المنزلقات في أي خطوة. اجعل <bdi dir="ltr">|AB| = 1</bdi> فيصبح Z حاصل الضرب <bdi dir="ltr">|AC| · |AD|</bdi>، أو اجعل <bdi dir="ltr">|AD| = 1</bdi> فيصبح القسمة <bdi dir="ltr">|AC| / |AB|</bdi>. وعدد الخطوات لا يتغير مهما كانت الأطوال: <bdi dir="ltr">O(1)</bdi> في هذا النموذج.</div>
      <Player s={s} />
    </div>
  );
}

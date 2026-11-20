# الخوارزميات · رحلة الأشهر الستة

موقع لدراسة الخوارزميات بالطريقة الجامعية خلال 26 أسبوعًا: 6 مراحل و63 درسًا، مبنية على مراجع جامعية مجانية (MIT 6.006 و6.046J و6.042J، وكتاب Jeff Erickson، وBook of Proof، وOpen Data Structures).

الموقع المنشور: https://yalhojaily.github.io/algorithms/

## أقسام كل درس
1. المشكلة · 2. الشرح · 3. المحاكاة · 4. الصحة والتحليل · 5. أسئلة فهم · 6. التمارين (تطبيق + مسائل جامعية) · 7. المختبر البرمجي

## البنية
```
src/
  data/curriculum.ts        المنهج كاملًا: المراحل، والدروس، والأسابيع، والمتطلبات، والمراجع
  content/lessons/*.mdx     الدروس (الدرس يظهر في الموقع بمجرد وجود ملفه)
  labs/*.ts                 كود البداية والحل النموذجي لكل مختبر
  engine/stepper.tsx        محرك الخطوات: useStepper + Player + Pseudocode
  lib/                      منطق الدروس (logic.ts) وحفظ التقدم (progress.ts)
  components/               Callout, QuickCheck, StepReveal, Exercise, CodeLab, والمحاكاة
  pages/                    الرئيسية، وصفحات المراحل، وقالب الدرس
tests/                      اختبارات Vitest
```

## التشغيل
```sh
npm install
npm run dev      # http://localhost:4321/algorithms/
npm test
npm run build
```

يُنشر الموقع تلقائيًا على GitHub Pages عبر GitHub Actions عند كل دفع إلى `main`.

// The full course map: 6 phases, 63 lessons, 26 weeks.
// A lesson is "available" once an MDX file with the same `id` exists in src/content/lessons.

export interface Lesson {
  id: string; // "0.1"
  title: string; // Arabic title
  en: string; // English term, shown beside the Arabic
  slug: string; // URL segment
  week: number; // week of the 26-week plan
  prereqs: string[]; // lesson ids that should be done first
  lab: boolean; // whether the lesson has a programming lab
}

export interface Reference {
  name: string;
  by: string;
  url: string;
}

export interface Phase {
  number: number;
  key: string; // URL segment
  title: string;
  en: string;
  weeks: [number, number];
  goal: string;
  refs: Reference[];
  lessons: Lesson[];
}

export const refs = {
  mcs: { name: 'Mathematics for Computer Science', by: 'Lehman, Leighton, Meyer — MIT', url: 'https://courses.csail.mit.edu/6.042/spring18/mcs.pdf' },
  bop: { name: 'Book of Proof', by: 'Richard Hammack', url: 'https://richardhammack.github.io/BookOfProof/' },
  ocw6042: { name: 'MIT 6.042J Mathematics for CS', by: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/' },
  ocw6006: { name: 'MIT 6.006 Introduction to Algorithms', by: 'MIT OpenCourseWare — Spring 2020', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/' },
  ocw6046: { name: 'MIT 6.046J Design and Analysis of Algorithms', by: 'MIT OpenCourseWare — Spring 2015', url: 'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/' },
  jeffe: { name: 'Algorithms', by: 'Jeff Erickson — University of Illinois', url: 'https://jeffe.cs.illinois.edu/teaching/algorithms/' },
  ods: { name: 'Open Data Structures', by: 'Pat Morin', url: 'https://opendatastructures.org/' },
  tim: { name: 'Algorithms Illuminated (videos)', by: 'Tim Roughgarden — Stanford', url: 'https://www.algorithmsilluminated.org/' },
} satisfies Record<string, Reference>;

const slugify = (id: string, en: string) =>
  `${id.replace('.', '-')}-${en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

type Raw = [id: string, title: string, en: string, week: number, opts?: { prereqs?: string[]; lab?: boolean }];

function phase(number: number, title: string, en: string, weeks: [number, number], goal: string, r: Reference[], raw: Raw[], labDefault: boolean): Phase {
  return {
    number,
    key: String(number),
    title,
    en,
    weeks,
    goal,
    refs: r,
    lessons: raw.map(([id, t, e, week, opts], i) => ({
      id,
      title: t,
      en: e,
      slug: slugify(id, e),
      week,
      prereqs: opts?.prereqs ?? (i > 0 ? [raw[i - 1][0]] : []),
      lab: opts?.lab ?? labDefault,
    })),
  };
}

export const curriculum: Phase[] = [
  phase(0, 'الرياضيات المتقطعة', 'Discrete Mathematics', [1, 3],
    'اللغة التي تُكتب بها الخوارزميات وبراهينها: المنطق، والمجموعات، والاستقراء، والعدّ، والمجاميع، والاحتمالات، والرسوم البيانية.',
    [refs.mcs, refs.bop, refs.ocw6042],
    [
      ['0.1', 'المنطق القضوي', 'Propositional Logic', 1, { prereqs: [], lab: true }],
      ['0.2', 'المُسوِّرات', 'Quantifiers', 1, { lab: true }],
      ['0.3', 'أساليب البرهان', 'Proof Techniques', 1, { lab: true }],
      ['0.4', 'المجموعات', 'Sets', 1, { lab: true }],
      ['0.5', 'العلاقات والدوال', 'Relations and Functions', 2, { lab: true }],
      ['0.6', 'الاستقراء الرياضي والاستقراء القوي', 'Induction and Strong Induction', 2, { prereqs: ['0.3'], lab: true }],
      ['0.7', 'التباديل والتوافيق', 'Permutations and Combinations', 2, { prereqs: ['0.4'], lab: true }],
      ['0.8', 'المتتاليات والمجاميع', 'Sequences and Sums', 2, { prereqs: ['0.6'], lab: true }],
      ['0.9', 'الأسس واللوغاريتمات', 'Exponents and Logarithms', 3, { lab: true }],
      ['0.10', 'الاحتمالات والقيمة المتوقعة', 'Probability and Expected Value', 3, { prereqs: ['0.7'], lab: true }],
      ['0.11', 'مبادئ نظرية الرسوم البيانية', 'Graph Theory Basics', 3, { prereqs: ['0.5', '0.6'], lab: true }],
    ], false),

  phase(1, 'أساسيات تحليل الخوارزميات', 'Foundations of Analysis', [4, 6],
    'كيف نصف الخوارزمية بدقة، ونثبت صحتها، ونقيس زمنها وذاكرتها، ونحل علاقات التكرار التي تنتج عن الاستدعاء الذاتي.',
    [refs.ocw6006, refs.jeffe, refs.tim],
    [
      ['1.1', 'ما الخوارزمية؟ ونموذج الحساب RAM', 'What Is an Algorithm', 4, { prereqs: ['0.1'] }],
      ['1.2', 'إثبات الصحة باستخدام Loop Invariants', 'Loop Invariants', 4, { prereqs: ['1.1', '0.6'] }],
      ['1.3', 'التعقيد الزمني والمكاني', 'Time and Space Complexity', 4],
      ['1.4', 'Big O وBig Ω وBig Θ', 'Asymptotic Notation', 5, { prereqs: ['1.3', '0.9'] }],
      ['1.5', 'أفضل الحالات وأسوؤها ومتوسطها', 'Best Worst Average Case', 5, { prereqs: ['1.4', '0.10'] }],
      ['1.6', 'الاستدعاء الذاتي وإثبات صحته بالاستقراء', 'Recursion', 5, { prereqs: ['1.2'] }],
      ['1.7', 'علاقات التكرار: التعويض وشجرة الاستدعاء', 'Recurrences', 6, { prereqs: ['1.6', '0.8'], lab: false }],
      ['1.8', 'Master Theorem', 'Master Theorem', 6, { lab: false }],
      ['1.9', 'مدخل إلى فرّق تسد باستخدام Merge Sort', 'Divide and Conquer Intro', 6],
    ], true),

  phase(2, 'هياكل البيانات والخوارزميات الأساسية', 'Data Structures', [7, 11],
    'الهياكل التي تُبنى عليها كل الخوارزميات، وكيف نختار بينها حسب العمليات التي نحتاجها وتكلفة كل عملية.',
    [refs.ocw6006, refs.ods, refs.jeffe],
    [
      ['2.1', 'المصفوفات والمصفوفات الديناميكية', 'Arrays and Dynamic Arrays', 7, { prereqs: ['1.4'] }],
      ['2.2', 'التحليل المُطفأ', 'Amortized Analysis', 7, { lab: false }],
      ['2.3', 'القوائم المترابطة', 'Linked Lists', 7, { prereqs: ['2.1'] }],
      ['2.4', 'المكدسات والطوابير', 'Stacks and Queues', 8],
      ['2.5', 'جداول التجزئة: دوال التجزئة والسلاسل', 'Hash Tables and Chaining', 8, { prereqs: ['2.1', '0.10'] }],
      ['2.6', 'العنونة المفتوحة ومعامل التحميل', 'Open Addressing', 8],
      ['2.7', 'البحث الثنائي', 'Binary Search', 9, { prereqs: ['1.2'] }],
      ['2.8', 'الترتيب بالإدراج والاختيار', 'Insertion and Selection Sort', 9],
      ['2.9', 'Merge Sort وQuick Sort', 'Merge Sort and Quick Sort', 9, { prereqs: ['2.8', '1.9'] }],
      ['2.10', 'الحد الأدنى للترتيب بالمقارنة', 'Comparison Sorting Lower Bound', 10, { lab: false }],
      ['2.11', 'الترتيب الخطي: Counting Sort وRadix Sort', 'Linear Time Sorting', 10],
      ['2.12', 'الكومة وطابور الأولوية وHeapsort', 'Heaps and Priority Queues', 10, { prereqs: ['2.9'] }],
      ['2.13', 'أشجار البحث الثنائية', 'Binary Search Trees', 11, { prereqs: ['2.7'] }],
      ['2.14', 'الأشجار المتوازنة: AVL', 'AVL Trees', 11],
      ['2.15', 'Union-Find', 'Union Find', 11, { prereqs: ['2.2'] }],
    ], true),

  phase(3, 'استراتيجيات تصميم الخوارزميات', 'Algorithm Design', [12, 17],
    'من «كيف تعمل هذه الخوارزمية؟» إلى «كيف أصمم خوارزمية لمسألة لم أرها من قبل؟»، مع برهان الصحة لكل استراتيجية.',
    [refs.jeffe, refs.ocw6046, refs.tim],
    [
      ['3.1', 'القوة الغاشمة', 'Brute Force', 12, { prereqs: ['0.7'] }],
      ['3.2', 'فرّق تسد المتقدم: Karatsuba وClosest Pair', 'Advanced Divide and Conquer', 12, { prereqs: ['1.8'] }],
      ['3.3', 'الخوارزميات الجشعة: جدولة الفترات', 'Greedy Interval Scheduling', 13],
      ['3.4', 'برهان الجشع: حجة التبادل', 'Exchange Argument', 13, { lab: false }],
      ['3.5', 'ترميز Huffman', 'Huffman Coding', 14, { prereqs: ['3.4', '2.12'] }],
      ['3.6', 'مدخل إلى البرمجة الديناميكية', 'Dynamic Programming Intro', 14, { prereqs: ['1.6'] }],
      ['3.7', 'البرمجة الديناميكية: LIS وLCS', 'LIS and LCS', 15],
      ['3.8', 'البرمجة الديناميكية: مسافة التحرير', 'Edit Distance', 15],
      ['3.9', 'البرمجة الديناميكية: مسألة الحقيبة', 'Knapsack', 16],
      ['3.10', 'البرمجة الديناميكية على الفترات', 'Interval DP Matrix Chain', 16],
      ['3.11', 'التراجع: N-Queens والمجموعات الجزئية', 'Backtracking', 17, { prereqs: ['3.1'] }],
      ['3.12', 'التراجع مع التقليم', 'Backtracking with Pruning', 17],
    ], true),

  phase(4, 'خوارزميات الرسوم البيانية', 'Graph Algorithms', [18, 22],
    'تمثيل العلاقات كرسوم بيانية، واجتيازها، وإيجاد أقصر المسارات، وأشجار التغطية، والتدفق الأعظم.',
    [refs.ocw6006, refs.jeffe, refs.ocw6046],
    [
      ['4.1', 'تمثيل الرسم البياني', 'Graph Representation', 18, { prereqs: ['0.11', '2.3'] }],
      ['4.2', 'البحث بالعرض BFS', 'Breadth First Search', 18, { prereqs: ['4.1', '2.4'] }],
      ['4.3', 'البحث بالعمق DFS وتصنيف الحواف', 'Depth First Search', 19],
      ['4.4', 'الترتيب الطوبولوجي', 'Topological Sort', 19],
      ['4.5', 'المكونات المترابطة بقوة', 'Strongly Connected Components', 20],
      ['4.6', 'خوارزمية Dijkstra', 'Dijkstra', 20, { prereqs: ['4.2', '2.12'] }],
      ['4.7', 'خوارزمية Bellman-Ford', 'Bellman Ford', 21, { prereqs: ['4.6', '3.6'] }],
      ['4.8', 'خوارزمية Floyd-Warshall', 'Floyd Warshall', 21],
      ['4.9', 'أشجار التغطية الصغرى: Kruskal وPrim', 'Minimum Spanning Trees', 22, { prereqs: ['4.1', '2.15', '3.4'] }],
      ['4.10', 'التدفق في الشبكات: Ford-Fulkerson', 'Network Flow', 22, { prereqs: ['4.3'] }],
      ['4.11', 'Max-Flow Min-Cut والتوفيق الثنائي', 'Max Flow Min Cut', 22, { lab: false }],
    ], true),

  phase(5, 'الموضوعات المتقدمة', 'Advanced Topics', [23, 25],
    'العشوائية كأداة تصميم، وحدود ما يمكن حسابه بكفاءة، وماذا نفعل حين تكون المسألة صعبة.',
    [refs.ocw6046, refs.jeffe, refs.mcs],
    [
      ['5.1', 'الخوارزميات العشوائية', 'Randomized Algorithms', 23, { prereqs: ['2.9', '1.5'] }],
      ['5.2', 'الفئتان P وNP', 'P and NP', 23, { prereqs: ['0.1'], lab: false }],
      ['5.3', 'الاختزال', 'Reductions', 24, { lab: false }],
      ['5.4', 'مسائل NP-Complete', 'NP Complete Problems', 24, { lab: false }],
      ['5.5', 'خوارزميات التقريب', 'Approximation Algorithms', 25, { prereqs: ['5.4', '3.3'] }],
    ], true),
];

export const allLessons: Lesson[] = curriculum.flatMap((p) => p.lessons);
export const lessonById = (id: string) => allLessons.find((l) => l.id === id);
export const phaseOf = (id: string) => curriculum.find((p) => p.lessons.some((l) => l.id === id))!;

export function neighbors(id: string) {
  const i = allLessons.findIndex((l) => l.id === id);
  return { prev: allLessons[i - 1], next: allLessons[i + 1] };
}

export const lessonHref = (base: string, l: Lesson) => `${base.replace(/\/$/, '')}/lessons/${l.slug}/`;
export const phaseHref = (base: string, p: Phase) => `${base.replace(/\/$/, '')}/phases/${p.key}/`;

/** Arabic ordinal-free label for a phase ("المرحلة 0"). */
export const phaseLabel = (p: Phase) => `المرحلة ${p.number}`;

/** The seven parts every lesson follows (the "lesson rhythm"). */
export const rhythm = [
  ['المشكلة', 'موقف حقيقي يجعلك تحتاج الفكرة'],
  ['الشرح', 'الحدس ثم التعريف الدقيق، من المراجع الجامعية'],
  ['المحاكاة', 'شغّل الخوارزمية بنفسك خطوة بخطوة'],
  ['الصحة والتحليل', 'لماذا تعمل؟ وكم تكلّف؟'],
  ['أسئلة فهم', 'توقّف وتأكد قبل أن تكمل'],
  ['التمارين', 'تطبيق ثم مسائل جامعية، مع تلميح وحل'],
  ['المختبر', 'اكتب الكود، واختبره، وقِس زمنه'],
] as const;

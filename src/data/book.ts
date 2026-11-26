// The book track: Jeff Erickson, "Algorithms" (1st edition, 2019), CC BY 4.0.
// Chapters and sections in the book's order, with book page numbers and the end-of-chapter exercises
// that belong to each section.

export interface BookSection {
  id: string;          // "1.3"
  slug: string;        // "1-3"
  en: string;
  ar: string;
  page: number;        // first book page
  exercises: number[]; // end-of-chapter exercises that practise this section
}
export interface BookChapter {
  num: number;
  slug: string;        // "01-recursion"
  en: string;
  ar: string;
  pages: [number, number];
  exercisesPage: number;
  blurb: string;
  sections: BookSection[];
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const sec = (id: string, en: string, ar: string, page: number, exercises: number[] = []): BookSection =>
  ({ id, slug: id.replace('.', '-'), en, ar, page, exercises });

export const BOOK = {
  title: 'Algorithms',
  author: 'Jeff Erickson',
  edition: 'الطبعة الأولى، 2019',
  license: 'CC BY 4.0',
  pdf: 'book/erickson-algorithms.pdf',
  offset: 18, // pdf page = book page + offset
  home: 'https://jeffe.cs.illinois.edu/teaching/algorithms/',
};

export const chapters: BookChapter[] = [
  {
    num: 0, slug: '00-introduction', en: 'Introduction', ar: 'مقدمة', pages: [1, 20], exercisesPage: 17,
    blurb: 'ما الخوارزمية، ومن أين جاءت الكلمة. ثلاث طرق قديمة للضرب، وخوارزمية توزع مقاعد الكونغرس، ومثال على ما ليس خوارزمية. ثم ما يطلبه الكتاب في كل وصف: ماذا، وكيف، ولماذا، وبأي سرعة.',
    sections: [
      sec('0.1', 'What is an algorithm?', 'ما الخوارزمية؟', 1),
      sec('0.2', 'Multiplication', 'الضرب', 3),
      sec('0.3', 'Congressional Apportionment', 'توزيع مقاعد الكونغرس', 8, [4]),
      sec('0.4', 'A Bad Example', 'مثال سيئ', 10),
      sec('0.5', 'Describing Algorithms', 'وصف الخوارزميات', 11, [0]),
      sec('0.6', 'Analyzing Algorithms', 'تحليل الخوارزميات', 14, [1, 2, 3]),
    ],
  },
  {
    num: 1, slug: '01-recursion', en: 'Recursion', ar: 'الاستدعاء الذاتي', pages: [21, 70], exercisesPage: 44,
    blurb: 'الاختزال إلى صندوق أسود، و«جنية الاستدعاء»، ثم فرّق تسد: أبراج هانوي، والترتيب بالدمج والسريع، وأشجار الاستدعاء، والاختيار في زمن خطي، والضرب السريع، والأس.',
    sections: [
      sec('1.1', 'Reductions', 'الاختزال', 21),
      sec('1.2', 'Simplify and Delegate', 'بسّط وفوّض', 22),
      sec('1.3', 'Tower of Hanoi', 'أبراج هانوي', 24, range(1, 5)),
      sec('1.4', 'Mergesort', 'الترتيب بالدمج', 26, [13, 14, 15]),
      sec('1.5', 'Quicksort', 'الترتيب السريع', 29, [9, 10]),
      sec('1.6', 'The Pattern', 'النمط العام', 31, range(26, 42)),
      sec('1.7', 'Recursion Trees', 'أشجار الاستدعاء', 31, [6, 7, 8, 11, 12]),
      sec('1.8', 'Linear-Time Selection', 'الاختيار في زمن خطي', 35, range(16, 21)),
      sec('1.9', 'Fast Multiplication', 'الضرب السريع', 40, [22, 23]),
      sec('1.10', 'Exponentiation', 'الرفع إلى أس', 42, [24, 25]),
    ],
  },
  {
    num: 2, slug: '02-backtracking', en: 'Backtracking', ar: 'التراجع', pages: [71, 96], exercisesPage: 93,
    blurb: 'ابنِ الحل قطعة قطعة، وجرّب كل خيار للقطعة التالية بالاستدعاء: الملكات، وأشجار الألعاب، ومجموع المجموعة الجزئية، وتقطيع النص، وأطول متتالية متزايدة، وأشجار البحث المثلى. وأهم سؤال في كل مرة: ماذا نتذكر من القرارات السابقة؟',
    sections: [
      sec('2.1', 'N Queens', 'الملكات', 71),
      sec('2.2', 'Game Trees', 'أشجار الألعاب', 74),
      sec('2.3', 'Subset Sum', 'مجموع المجموعة الجزئية', 76, [1]),
      sec('2.4', 'The General Pattern', 'النمط العام', 79, [3]),
      sec('2.5', 'Text Segmentation (Interpunctio Verborum)', 'تقطيع النص', 80, [2]),
      sec('2.6', 'Longest Increasing Subsequence', 'أطول متتالية متزايدة', 86, [5]),
      sec('2.7', 'Longest Increasing Subsequence, Take 2', 'أطول متتالية متزايدة، المحاولة الثانية', 89, [4]),
      sec('2.8', 'Optimal Binary Search Trees', 'أشجار البحث الثنائية المثلى', 91, [6]),
    ],
  },
  {
    num: 3, slug: '03-dynamic-programming', en: 'Dynamic Programming', ar: 'البرمجة الديناميكية', pages: [97, 158], exercisesPage: 123,
    blurb: 'استدعاء بلا تكرار. خوارزميات التراجع من الفصل 2 كانت تحل المسائل الجزئية نفسها مرة بعد مرة. احفظ كل جواب في جدول، ثم املأ الجدول بالترتيب الصحيح عمدًا: Fibonacci، وتقطيع النص، وأطول متتالية متزايدة، والمسافة التحريرية، ومجموع المجموعة الجزئية، والأشجار المثلى، والأشجار.',
    sections: [
      sec('3.1', 'Mātrāvṛtta', 'المقاطع الشعرية وFibonacci', 97),
      sec('3.2', 'Aside: Even Faster Fibonacci Numbers', 'استطراد: Fibonacci أسرع', 103),
      sec('3.3', 'Interpunctio Verborum Redux', 'تقطيع النص مرة أخرى', 105, [2]),
      sec('3.4', 'The Pattern: Smart Recursion', 'النمط: استدعاء ذكي', 105, [3, 4]),
      sec('3.5', 'Warning: Greed is Stupid', 'تحذير: الجشع غباء', 107, [1]),
      sec('3.6', 'Longest Increasing Subsequence', 'أطول متتالية متزايدة', 109, [5, 10]),
      sec('3.7', 'Edit Distance', 'المسافة التحريرية', 111, [6, 7, 9]),
      sec('3.8', 'Subset Sum', 'مجموع المجموعة الجزئية', 116),
      sec('3.9', 'Optimal Binary Search Trees', 'أشجار البحث الثنائية المثلى', 117, [12, 33, 38]),
      sec('3.10', 'Dynamic Programming on Trees', 'البرمجة الديناميكية على الأشجار', 120, [46, 49]),
    ],
  },
  {
    num: 4, slug: '04-greedy', en: 'Greedy Algorithms', ar: 'الخوارزميات الجشعة', pages: [159, 186], exercisesPage: 176,
    blurb: 'الأحيان النادرة التي ينجح فيها الجشع، وكيف تبرهن أنها منها: ترتيب الملفات على شريط، وجدول المحاضرات، وشفرات Huffman، والمطابقة المستقرة التي نال بسببها Shapley جائزة Nobel. والأداة في كل مرة واحدة: حجة التبديل.',
    sections: [
      sec('4.1', 'Storing Files on Tape', 'تخزين الملفات على شريط', 159, [17]),
      sec('4.2', 'Scheduling Classes', 'جدولة المحاضرات', 161, [1, 2, 3, 4, 5]),
      sec('4.3', 'General Pattern', 'النمط العام', 164, [14, 16]),
      sec('4.4', 'Huffman Codes', 'شفرات Huffman', 165, [6, 7, 8]),
      sec('4.5', 'Stable Matching', 'المطابقة المستقرة', 170, [9, 10, 11]),
    ],
  },
  {
    num: 5, slug: '05-graphs', en: 'Basic Graph Algorithms', ar: 'خوارزميات الرسوم الأساسية', pages: [187, 224], exercisesPage: 207,
    blurb: 'الرسم: مجموعة أزواج من الأشياء. تعريفاته ومصطلحاته، وطرق تمثيله بقوائم الجوار ومصفوفة الجوار، ثم خوارزمية واحدة عامة لزيارة كل ما يمكن الوصول إليه: البحث «أيًا كان أولًا». بمكدس تصير بحثًا بالعمق، وبطابور بحثًا بالعرض، وبطابور أولويات Prim وDijkstra. وأخيرًا ملء المناطق في الصور، أول مثال على الاختزال إلى رسم.',
    sections: [
      sec('5.1', 'Introduction and History', 'مقدمة وتاريخ', 187),
      sec('5.2', 'Basic Definitions', 'التعريفات الأساسية', 190, [1, 2, 3]),
      sec('5.3', 'Representations and Examples', 'التمثيلات والأمثلة', 192, [5, 6]),
      sec('5.4', 'Data Structures', 'بنى البيانات', 195),
      sec('5.5', 'Whatever-First Search', 'البحث أيًا كان أولًا', 199, [9, 10]),
      sec('5.6', 'Important Variants', 'المتغيرات المهمة', 201, [8]),
      sec('5.7', 'Graph Reductions: Flood Fill', 'الاختزال إلى رسم: ملء المناطق', 205, [11, 14, 16, 19]),
    ],
  },
  {
    num: 6, slug: '06-dfs', en: 'Depth-First Search', ar: 'البحث بالعمق', pages: [225, 256], exercisesPage: 244,
    blurb: 'البحث بالعمق في الرسوم الموجهة، بساعة تسجل متى يبدأ كل رأس ومتى ينتهي. من هذين الرقمين وحدهما: تصنيف الحواف، وكشف الدورات، والترتيب الطوبولوجي، ورؤية البرمجة الديناميكية بحثًا بالعمق في الرسم الاعتمادي، ثم المكونات القوية في زمن خطي بخوارزميتي Kosaraju–Sharir وTarjan.',
    sections: [
      sec('6.1', 'Preorder and Postorder', 'الترتيب القبلي والبعدي', 227, [10]),
      sec('6.2', 'Detecting Cycles', 'كشف الدورات', 231, [11]),
      sec('6.3', 'Topological Sort', 'الترتيب الطوبولوجي', 232, [1, 12]),
      sec('6.4', 'Memoization and Dynamic Programming', 'الحفظ والبرمجة الديناميكية', 234, [3, 13]),
      sec('6.5', 'Strong Connectivity', 'الاتصال القوي', 237, [0, 2, 9]),
      sec('6.6', 'Strong Components in Linear Time', 'المكونات القوية في زمن خطي', 238, [4, 5, 19, 21]),
    ],
  },
  {
    num: 7, slug: '07-mst', en: 'Minimum Spanning Trees', ar: 'أشجار التغطية الصغرى', pages: [257, 272], exercisesPage: 268,
    blurb: 'أرخص طريقة لربط كل الرؤوس. مع أوزان مختلفة الشجرة الصغرى وحيدة، وكل خوارزمياتها تقريبًا حالة من خوارزمية عامة واحدة: أضف حواف آمنة. ثم الثلاث الكلاسيكية: Borůvka تضيف كل الحواف الآمنة دفعة واحدة، وJarník يكبّر شجرة واحدة، وKruskal يمر على الحواف من الأخف، ومعه بنية المجموعات المنفصلة.',
    sections: [
      sec('7.1', 'Distinct Edge Weights', 'أوزان مختلفة', 257, [2]),
      sec('7.2', 'The Only Minimum Spanning Tree Algorithm', 'خوارزمية الشجرة الصغرى الوحيدة', 259, [1, 3]),
      sec('7.3', 'Borůvka’s Algorithm', 'خوارزمية Borůvka', 261, [8, 10]),
      sec('7.4', 'Jarník’s (“Prim’s”) Algorithm', 'خوارزمية Jarník («Prim»)', 263, [7, 9]),
      sec('7.5', 'Kruskal’s Algorithm', 'خوارزمية Kruskal', 265, [4, 5, 6]),
    ],
  },
];

/** The whole book, for the table of contents (chapters not yet on the site are shown as coming). */
export const TOC: { num: number; en: string; ar: string; page: number }[] = [
  { num: 0, en: 'Introduction', ar: 'مقدمة', page: 1 },
  { num: 1, en: 'Recursion', ar: 'الاستدعاء الذاتي', page: 21 },
  { num: 2, en: 'Backtracking', ar: 'التراجع', page: 71 },
  { num: 3, en: 'Dynamic Programming', ar: 'البرمجة الديناميكية', page: 97 },
  { num: 4, en: 'Greedy Algorithms', ar: 'الخوارزميات الجشعة', page: 159 },
  { num: 5, en: 'Basic Graph Algorithms', ar: 'خوارزميات الرسوم الأساسية', page: 187 },
  { num: 6, en: 'Depth-First Search', ar: 'البحث بالعمق', page: 225 },
  { num: 7, en: 'Minimum Spanning Trees', ar: 'أشجار التغطية الصغرى', page: 257 },
  { num: 8, en: 'Shortest Paths', ar: 'أقصر المسارات', page: 273 },
  { num: 9, en: 'All-Pairs Shortest Paths', ar: 'أقصر المسارات بين كل الأزواج', page: 309 },
  { num: 10, en: 'Maximum Flows & Minimum Cuts', ar: 'التدفق الأعظم والقطع الأصغر', page: 327 },
  { num: 11, en: 'Applications of Flows and Cuts', ar: 'تطبيقات التدفق والقطع', page: 353 },
  { num: 12, en: 'NP-Hardness', ar: 'صعوبة NP', page: 379 },
];

export const chapterBySlug = (slug: string) => chapters.find((c) => c.slug === slug);
export const sectionOf = (id: string) => {
  for (const c of chapters) { const s = c.sections.find((x) => x.id === id); if (s) return { chapter: c, section: s }; }
  return undefined;
};
export const bookHref = (base: string, ch: BookChapter, s?: BookSection) =>
  `${base.replace(/\/$/, '')}/book/${ch.slug}/${s ? `${s.slug}/` : ''}`;
export const pdfHref = (base: string, bookPage: number) =>
  `${base.replace(/\/$/, '')}/${BOOK.pdf}#page=${bookPage + BOOK.offset}`;

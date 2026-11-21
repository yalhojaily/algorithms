// Starter and model-solution code for the lab in book section 0.6.

export const starter = `// Two ways of measuring an algorithm from section 0.6.

// 1) Run NDaysOfChristmas(n) and count, instead of singing:
//      lines    = how many Sing statements execute (a "Sing" of "and" counts as a line)
//      mentions = how many times a gift is named (the partridge counts)
//      gifts    = how many gifts my true love gave to me in total (on day i: i of gift i, ..., 1 partridge)
//    Return { lines, mentions, gifts }. Simulate the loops; don't use the closed forms.
function countChristmas(n) {
  // your code here
}

// 2) The Census Bureau's way: Huntington-Hill where the "priority queue" is just the array of
//    priorities, scanned in full for the maximum each time (ties go to the smaller index).
//    pop is an array of populations, R ≥ pop.length. Return the array of seats.
function hhScan(pop, R) {
  // your code here
}
`;

export const solution = `function countChristmas(n) {
  let lines = 0, mentions = 0, gifts = 0;
  for (let i = 1; i <= n; i++) {
    lines++;                                   // "On the i-th day of Christmas ..."
    for (let j = i; j >= 2; j--) { lines++; mentions++; gifts += j; }
    if (i > 1) lines++;                        // "and"
    lines++; mentions++; gifts += 1;           // "a partridge in a pear tree."
  }
  return { lines, mentions, gifts };
}

function hhScan(pop, R) {
  const n = pop.length, rep = new Array(n).fill(1);
  const pr = pop.map((p) => p / Math.sqrt(2));
  for (let k = n; k < R; k++) {
    let best = 0;                              // ExtractMax by a full scan: Θ(n)
    for (let s = 1; s < n; s++) if (pr[s] > pr[best]) best = s;
    rep[best]++;
    pr[best] = pop[best] / Math.sqrt(rep[best] * (rep[best] + 1));
  }
  return rep;
}
`;

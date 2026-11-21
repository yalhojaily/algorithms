// Starter and model-solution code for the lab in lesson 0.10.

export const starter = `// 1) Probability that among k people (birthdays uniform over d days) two share a birthday.
//    Use the complement: 1 − (d/d)·((d−1)/d)·…·((d−k+1)/d).
function birthdayProb(k, d) {
  // your code here
}

// 2) The smallest k for which birthdayProb(k, d) ≥ 1/2.   peopleFor50(365) → 23
function peopleFor50(d) {
  // your code here
}

// 3) Bayes: P(sick | test positive), given
//    prior = P(sick), sens = P(positive | sick), fpr = P(positive | healthy).
function bayes(prior, sens, fpr) {
  // your code here
}

// 4) Expected number of draws to collect all n coupon types: n · H(n).
function expectedCoupon(n) {
  // your code here
}

// 5) One random run of the coupon collector: draw Math.floor(Math.random() * n)
//    until all n types are seen; return the number of draws.
function simulateCoupon(n) {
  // your code here
}

// 6) One Monty Hall game. Return 1 if you win the car, else 0.
function montyTrial(switchDoors) {
  // your code here
}

// 7) Monte Carlo: run trial() N times and return the average of its results.
function estimate(trial, N) {
  // your code here
}
`;

export const solution = `function birthdayProb(k, d) {
  let q = 1;
  for (let i = 0; i < k; i++) q *= (d - i) / d;
  return 1 - Math.max(q, 0);
}

function peopleFor50(d) {
  let q = 1, k = 0;
  while (1 - q < 0.5) { q *= (d - k) / d; k++; }
  return k;
}

function bayes(prior, sens, fpr) {
  const pos = sens * prior + fpr * (1 - prior);   // total probability of a positive test
  return (sens * prior) / pos;
}

function expectedCoupon(n) {
  let h = 0;
  for (let i = 1; i <= n; i++) h += 1 / i;
  return n * h;
}

function simulateCoupon(n) {
  const seen = new Uint8Array(n);
  let distinct = 0, draws = 0;
  while (distinct < n) {
    const c = Math.floor(Math.random() * n);
    draws++;
    if (!seen[c]) { seen[c] = 1; distinct++; }
  }
  return draws;
}

function montyTrial(switchDoors) {
  const car = Math.floor(Math.random() * 3);
  const pick = Math.floor(Math.random() * 3);
  // If you switch, you win exactly when your first pick was wrong.
  return switchDoors ? (pick !== car ? 1 : 0) : (pick === car ? 1 : 0);
}

function estimate(trial, N) {
  let s = 0;
  for (let i = 0; i < N; i++) s += trial();
  return s / N;
}
`;

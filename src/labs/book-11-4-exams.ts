// Starter and model-solution code for the lab in book section 11.4.

export const starter = `// Exam scheduling. enroll[i] students in class i; seats[j] seats in room j; avail[k][l] = true if proctor l
// is free in time slot k; each proctor oversees at most maxPer exams.
// Return an array with one entry per class: [room, time, proctor], or null if some class cannot be scheduled.

function scheduleExams(enroll, seats, avail, maxPer) {
  // your code here: build the five-layer network, find a maximum flow, decompose it into paths
}
`;

export const solution = `function scheduleExams(enroll, seats, avail, maxPer) {
  const n = enroll.length, r = seats.length, T = avail.length, p = T ? avail[0].length : 0;
  const C = (i) => 1 + i, R = (j) => 1 + n + j, Tm = (k) => 1 + n + r + k, P = (l) => 1 + n + r + T + l;
  const t = 1 + n + r + T + p, V = t + 1, E = [];
  for (let i = 0; i < n; i++) E.push([0, C(i), 1]);
  for (let i = 0; i < n; i++) for (let j = 0; j < r; j++) if (enroll[i] <= seats[j]) E.push([C(i), R(j), Infinity]);
  for (let j = 0; j < r; j++) for (let k = 0; k < T; k++) E.push([R(j), Tm(k), 1]);
  for (let k = 0; k < T; k++) for (let l = 0; l < p; l++) if (avail[k][l]) E.push([Tm(k), P(l), 1]);
  for (let l = 0; l < p; l++) E.push([P(l), t, maxPer]);
  const f = E.map(() => 0);
  let value = 0;
  for (;;) {
    const via = new Array(V).fill(null), seen = new Array(V).fill(false), q = [0];
    seen[0] = true;
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      E.forEach(([a, b, c], k) => {
        if (a === u && !seen[b] && f[k] < c) { seen[b] = true; via[b] = [k, 1, u]; q.push(b); }
        if (b === u && !seen[a] && f[k] > 0) { seen[a] = true; via[a] = [k, -1, u]; q.push(a); }
      });
    }
    if (!seen[t]) break;
    for (let x = t; x !== 0; x = via[x][2]) f[via[x][0]] += via[x][1];
    value++;
  }
  if (value < n) return null;
  const out = new Array(n).fill(null);
  for (let a = 0; a < n; a++) {                     // decompose: one path per class
    const path = [0];
    let x = 0;
    while (x !== t) { const k = E.findIndex(([u], j) => u === x && f[j] > 0); f[k]--; x = E[k][1]; path.push(x); }
    out[path[1] - 1] = [path[2] - 1 - n, path[3] - 1 - n - r, path[4] - 1 - n - r - T];
  }
  return out;
}
`;

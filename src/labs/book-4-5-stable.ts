// Starter and model-solution code for the lab in book section 4.5.

export const starter = `// Stable matching with n hospitals and n doctors, numbered 0 .. n−1.
// hpref[h] lists doctors in hospital h's order of preference; dpref[d] lists hospitals.

// 1) Gale–Shapley with hospitals making offers. Return match, where match[h] is h's doctor.
//    Aim for O(n²): precompute rank[d][h] so a doctor compares two offers in O(1).
function galeShapley(hpref, dpref) {
  // your code here
}

// 2) true iff the matching (match[h] = doctor) has no unstable pair.
function isStable(match, hpref, dpref) {
  // your code here
}
`;

export const solution = `function galeShapley(hpref, dpref) {
  const n = hpref.length;
  const rank = dpref.map((list) => { const r = new Array(n); list.forEach((h, k) => (r[h] = k)); return r; });
  const next = new Array(n).fill(0);          // next doctor each hospital will ask
  const holder = new Array(n).fill(-1);       // holder[d] = hospital d currently holds
  const free = [];
  for (let h = n - 1; h >= 0; h--) free.push(h);
  while (free.length) {
    const h = free.pop();
    const d = hpref[h][next[h]++];
    if (holder[d] === -1) holder[d] = h;
    else if (rank[d][h] < rank[d][holder[d]]) { free.push(holder[d]); holder[d] = h; }
    else free.push(h);
  }
  const match = new Array(n);
  holder.forEach((h, d) => (match[h] = d));
  return match;
}

function isStable(match, hpref, dpref) {
  const n = match.length, hospOf = new Array(n);
  match.forEach((d, h) => (hospOf[d] = h));
  for (let h = 0; h < n; h++)
    for (const d of hpref[h]) {
      if (d === match[h]) break;                // only doctors h prefers to its own
      if (dpref[d].indexOf(h) < dpref[d].indexOf(hospOf[d])) return false;
    }
  return true;
}
`;

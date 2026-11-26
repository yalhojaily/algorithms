// Starter and model-solution code for the lab in book section 12.6.

export const starter = `// Tseitin: circuit → 3CNF. Circuit format as in 12.1 (gates may have more than two inputs).
// Return { nVars, clauses }: each clause is an array of EXACTLY three nonzero integers,
// +v for variable v and −v for its negation (variables numbered from 1, as in the DIMACS format).
// The formula must be satisfiable if and only if the circuit is.

function toThreeCNF(n, gates) {
  // your code here: binary gates, one CNF piece per gate, then pad short clauses with new variables
}
`;

export const solution = `function toThreeCNF(n, gates) {
  let nVars = n;                       // variable v + 1 for wire v
  const wireVar = [];
  for (let i = 0; i < n; i++) wireVar.push(i + 1);
  const short = [];                    // clauses with 1–3 literals
  const gate2 = (op, b, c) => {        // a fresh variable a with a = b op c
    const a = ++nVars;
    if (op === "and") short.push([a, -b, -c], [-a, b], [-a, c]);
    else short.push([-a, b, c], [a, -b], [a, -c]);
    return a;
  };
  for (const [op, ...ins] of gates) {
    const vs = ins.map((i) => wireVar[i]);
    if (op === "not") { const a = ++nVars; short.push([a, vs[0]], [-a, -vs[0]]); wireVar.push(a); continue; }
    let acc = vs[0];
    if (vs.length === 1) { acc = gate2(op, vs[0], vs[0]); }
    for (let k = 1; k < vs.length; k++) acc = gate2(op, acc, vs[k]);
    wireVar.push(acc);
  }
  short.push([wireVar[wireVar.length - 1]]);
  const clauses = [];
  for (const c of short) {
    if (c.length === 3) clauses.push(c);
    else if (c.length === 2) { const x = ++nVars; clauses.push([...c, x], [...c, -x]); }
    else { const x = ++nVars, y = ++nVars; clauses.push([c[0], x, y], [c[0], -x, y], [c[0], x, -y], [c[0], -x, -y]); }
  }
  return { nVars, clauses };
}
`;

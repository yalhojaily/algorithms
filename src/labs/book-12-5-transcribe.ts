// Starter and model-solution code for the lab in book section 12.5.

export const starter = `// Transcribe a circuit into a formula, as in Figure 12.5. Formulas are nested arrays:
//   ["var", i]   ["not", F]   ["and", F, G, …]   ["or", F, G, …]   ["iff", F, G]
// Variables 0 … n−1 are the inputs; variable n + g is the output wire of gate g.
// Circuit format as in 12.1: gates[g] = [op, ...inputWires], op ∈ {"and", "or", "not"}.

// The formula: (y_g ⇔ gate g) for every gate, and finally the output variable.
function transcribe(n, gates) {
  // your code here
}

// Evaluate a formula under an assignment (array of booleans indexed by variable).
function evalFormula(F, a) {
  // your code here
}
`;

export const solution = `function transcribe(n, gates) {
  const parts = gates.map(([op, ...ins], g) =>
    ["iff", ["var", n + g], op === "not" ? ["not", ["var", ins[0]]] : [op, ...ins.map((i) => ["var", i])]]);
  parts.push(["var", n + gates.length - 1]);
  return ["and", ...parts];
}

function evalFormula(F, a) {
  const [op, ...args] = F;
  if (op === "var") return a[args[0]];
  if (op === "not") return !evalFormula(args[0], a);
  if (op === "and") return args.every((G) => evalFormula(G, a));
  if (op === "or") return args.some((G) => evalFormula(G, a));
  if (op === "iff") return evalFormula(args[0], a) === evalFormula(args[1], a);
  throw new Error("unknown operator " + op);
}
`;

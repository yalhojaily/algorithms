// Starter and model-solution code for the lab in book section 12.1.

export const starter = `// A boolean circuit: inputs are wires 0 … n−1; gates[g] = [op, ...inputWires] with op "and", "or" or "not",
// and gate g drives wire n + g. The output is the last gate's wire.

// Values of every wire for the input bits x (an array of n booleans).
function evalCircuit(n, gates, x) {
  // your code here
}

// CircuitSat by brute force: a satisfying input (array of n booleans), or null.
function circuitSat(n, gates) {
  // your code here: try all 2^n inputs
}
`;

export const solution = `function evalCircuit(n, gates, x) {
  const w = x.slice(0, n);
  for (const [op, ...ins] of gates) {
    const v = ins.map((i) => w[i]);
    w.push(op === "and" ? v.every(Boolean) : op === "or" ? v.some(Boolean) : !v[0]);
  }
  return w;
}

function circuitSat(n, gates) {
  for (let m = 0; m < 2 ** n; m++) {
    const x = [];
    for (let i = 0; i < n; i++) x.push(Math.floor(m / 2 ** i) % 2 === 1);
    const w = evalCircuit(n, gates, x);
    if (w[w.length - 1]) return x;
  }
  return null;
}
`;

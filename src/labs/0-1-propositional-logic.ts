// Starter and model-solution code for the lab in lesson 0.1.
// Kept here (not inline in the MDX) so the indentation survives.

export const starter = `// A formula is a function of booleans, e.g.  P → Q  is:
//   const f = (P, Q) => !P || Q;
// f.length is the number of variables; call it with f(...assignment).

// 1) Every assignment of n variables, in textbook order:
//    allAssignments(2) → [[true,true],[true,false],[false,true],[false,false]]
//    allAssignments(0) → [[]]   (one empty assignment)
function allAssignments(n) {
  // your code here
}

// 2) Is f true on every assignment?
function isValid(f) {
  // your code here
}

// 3) Return one assignment (an array) that makes f true, or null if none exists.
function findSatisfying(f) {
  // your code here
}

// 4) Do f and g agree on every assignment? (same number of variables)
function equivalent(f, g) {
  // your code here
}
`;

export const solution = `function allAssignments(n) {
  if (n === 0) return [[]];
  const rest = allAssignments(n - 1);
  // first variable = true for the first half, false for the second
  return [...rest.map((a) => [true, ...a]), ...rest.map((a) => [false, ...a])];
}

function isValid(f) {
  return allAssignments(f.length).every((a) => f(...a));
}

function findSatisfying(f) {
  return allAssignments(f.length).find((a) => f(...a)) ?? null;
}

function equivalent(f, g) {
  return allAssignments(f.length).every((a) => f(...a) === g(...a));
}
`;

// Starter and model-solution code for the lab in book section 2.2.

export const starter = `// PlayAnyGame on Nim: a few heaps of stones; a move removes one or more stones from ONE heap.
// The player who cannot move (all heaps empty) has lost. A state is an array of heap sizes.

// 1) Is this state Good for the player about to move? Plain backtracking, exactly as in the book:
//    Good if some move leads to a Bad state for the opponent; Bad otherwise.
function isGood(heaps) {
  // your code here
}

// 2) Return a good move as [heapIndex, newSize] (newSize < heaps[heapIndex]),
//    or null if the state is Bad.
function goodMove(heaps) {
  // your code here
}
`;

export const solution = `function isGood(heaps) {
  for (let i = 0; i < heaps.length; i++) {
    for (let k = 0; k < heaps[i]; k++) {           // leave k stones in heap i
      const next = heaps.slice(); next[i] = k;
      if (!isGood(next)) return true;               // a move to a Bad state
    }
  }
  return false;                                     // no moves at all, or every move is to a Good state
}

function goodMove(heaps) {
  for (let i = 0; i < heaps.length; i++) {
    for (let k = 0; k < heaps[i]; k++) {
      const next = heaps.slice(); next[i] = k;
      if (!isGood(next)) return [i, k];
    }
  }
  return null;
}
`;

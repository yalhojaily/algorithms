// Starter and model-solution code for the lab in book section 4.4.

export const starter = `// Huffman codes. freq is an object like { A: 3, B: 1, ... } with at least two letters.

// 1) Return an optimal prefix-free code: an object mapping each letter to a string of "0"/"1".
//    Merge the two least frequent trees, again and again. (A sorted array is fine as a priority
//    queue here; a heap is better.)
function huffmanCode(freq) {
  // your code here
}

// 2) Encode a message with a code (concatenate the code words).
function encode(text, code) {
  // your code here
}

// 3) Decode a bit string with the same code. (Hint: walk the code words, or rebuild the tree.)
function decode(bits, code) {
  // your code here
}
`;

export const solution = `function huffmanCode(freq) {
  let forest = Object.entries(freq).map(([ch, w]) => ({ w, ch, left: null, right: null }));
  while (forest.length > 1) {
    forest.sort((a, b) => a.w - b.w);
    const [x, y] = forest.splice(0, 2);
    forest.push({ w: x.w + y.w, ch: null, left: x, right: y });
  }
  const code = {};
  const walk = (t, c) => {
    if (t.ch !== null) { code[t.ch] = c || "0"; return; }
    walk(t.left, c + "0");
    walk(t.right, c + "1");
  };
  walk(forest[0], "");
  return code;
}

function encode(text, code) {
  let out = "";
  for (const ch of text) out += code[ch];
  return out;
}

function decode(bits, code) {
  const back = new Map(Object.entries(code).map(([ch, c]) => [c, ch]));
  let out = "", cur = "";
  for (const b of bits) {
    cur += b;
    if (back.has(cur)) { out += back.get(cur); cur = ""; }   // prefix-free: the first match is the right one
  }
  return out;
}
`;

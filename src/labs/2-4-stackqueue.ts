// Starter and model-solution code for the lab in lesson 2.4.

export const starter = `// 1) A queue on a circular array. Rules: this.a has fixed length (the capacity);
//    the front is at this.head, the i-th element at (this.head + i) % capacity.
//    Double the capacity when full. No .shift() or .splice() anywhere.
class ArrayQueue {
  constructor() { this.a = new Array(4); this.head = 0; this.n = 0; }
  size() { return this.n; }
  enqueue(x) {
    // your code here
  }
  dequeue() {
    // your code here (throw a RangeError if empty)
  }
  front() {
    // your code here (throw a RangeError if empty)
  }
}

// 2) A queue made of two stacks (plain JS arrays used only with push and pop).
class QueueFromStacks {
  constructor() { this.inS = []; this.outS = []; this.moves = 0; } // count every element moved in -> out
  size() { return this.inS.length + this.outS.length; }
  enqueue(x) {
    // your code here
  }
  dequeue() {
    // your code here
  }
}

// 3) Are the brackets ()[]{} in s balanced? Other characters are ignored.
function isBalanced(s) {
  // your code here
}

// 4) Evaluate a postfix expression given as an array of tokens, e.g. ["3", "4", "+", "2", "*"].
//    Operators: + - * /. Throw an Error if the expression is malformed.
function evalPostfix(tokens) {
  // your code here
}

// 5) For each i, the first element to the RIGHT of A[i] that is larger than A[i], or -1.
//    Must run in O(n): keep a stack of indices still waiting for their answer.
function nextGreater(A) {
  // your code here
}
`;

export const solution = `class ArrayQueue {
  constructor() { this.a = new Array(4); this.head = 0; this.n = 0; }
  size() { return this.n; }
  resize(cap) {
    const b = new Array(cap);
    for (let k = 0; k < this.n; k++) b[k] = this.a[(this.head + k) % this.a.length];
    this.a = b;
    this.head = 0;
  }
  enqueue(x) {
    if (this.n === this.a.length) this.resize(2 * this.a.length);
    this.a[(this.head + this.n) % this.a.length] = x;   // wrap around
    this.n++;
  }
  dequeue() {
    if (this.n === 0) throw new RangeError('empty queue');
    const x = this.a[this.head];
    this.a[this.head] = undefined;
    this.head = (this.head + 1) % this.a.length;
    this.n--;
    return x;
  }
  front() {
    if (this.n === 0) throw new RangeError('empty queue');
    return this.a[this.head];
  }
}

class QueueFromStacks {
  constructor() { this.inS = []; this.outS = []; this.moves = 0; }
  size() { return this.inS.length + this.outS.length; }
  enqueue(x) { this.inS.push(x); }
  dequeue() {
    if (this.outS.length === 0) {
      while (this.inS.length) { this.outS.push(this.inS.pop()); this.moves++; }  // reverses the order
    }
    if (this.outS.length === 0) throw new RangeError('empty queue');
    return this.outS.pop();
  }
}

function isBalanced(s) {
  const pair = { ')': '(', ']': '[', '}': '{' };
  const st = [];
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') st.push(c);
    else if (c in pair) { if (st.pop() !== pair[c]) return false; }
  }
  return st.length === 0;
}

function evalPostfix(tokens) {
  const st = [];
  for (const t of tokens) {
    if ('+-*/'.includes(t) && t.length === 1) {
      if (st.length < 2) throw new Error('missing operand');
      const b = st.pop(), a = st.pop();
      st.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : a / b);
    } else st.push(Number(t));
  }
  if (st.length !== 1) throw new Error('malformed expression');
  return st[0];
}

function nextGreater(A) {
  const ans = new Array(A.length).fill(-1);
  const st = [];                          // indices whose answer is still unknown; their values decrease
  for (let i = 0; i < A.length; i++) {
    while (st.length && A[st[st.length - 1]] < A[i]) ans[st.pop()] = A[i];
    st.push(i);
  }
  return ans;
}
`;

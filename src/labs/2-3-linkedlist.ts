// Starter and model-solution code for the lab in lesson 2.3.

export const starter = `// A node is a plain object { val, next }, and a list is its head node (or null when empty).
// Helpers you may use (they are given, do not change them):
function fromArray(A) {
  let head = null;
  for (let i = A.length - 1; i >= 0; i--) head = { val: A[i], next: head };
  return head;
}
function toArray(head) {
  const out = [];
  for (let p = head; p !== null; p = p.next) out.push(p.val);
  return out;
}

// In the functions below, do NOT copy the list into an array: work with the pointers,
// using O(1) extra memory.

// 1) Reverse the list in place; return the new head.
function reverse(head) {
  // your code here
}

// 2) Return the middle node (for an even length, the second of the two middle nodes).
//    One pass, without counting the length first.
function middle(head) {
  // your code here
}

// 3) Does the list contain a cycle? (Floyd's tortoise and hare.)
function hasCycle(head) {
  // your code here
}

// 4) Merge two sorted lists into one sorted list by relinking nodes (no new nodes,
//    except possibly one dummy node). Return the head.
function mergeSorted(a, b) {
  // your code here
}

// 5) Remove every node whose val === x. Return the new head.
function removeAll(head, x) {
  // your code here
}

// For the timing experiment.
function buildAndReverse(n) {
  let head = null;
  for (let i = 0; i < n; i++) head = { val: i, next: head };
  return reverse(head);
}
`;

export const solution = `function fromArray(A) {
  let head = null;
  for (let i = A.length - 1; i >= 0; i--) head = { val: A[i], next: head };
  return head;
}
function toArray(head) {
  const out = [];
  for (let p = head; p !== null; p = p.next) out.push(p.val);
  return out;
}

function reverse(head) {
  let prev = null, cur = head;
  while (cur !== null) {
    const nxt = cur.next;   // save before we overwrite it
    cur.next = prev;        // flip one arrow
    prev = cur;
    cur = nxt;
  }
  return prev;
}

function middle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

function hasCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

function mergeSorted(a, b) {
  const dummy = { val: null, next: null };
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}

function removeAll(head, x) {
  const dummy = { val: null, next: head };
  let p = dummy;
  while (p.next !== null) {
    if (p.next.val === x) p.next = p.next.next;   // unlink, stay put
    else p = p.next;
  }
  return dummy.next;
}

function buildAndReverse(n) {
  let head = null;
  for (let i = 0; i < n; i++) head = { val: i, next: head };
  return reverse(head);
}
`;

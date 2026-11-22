// Starter and model-solution code for the lab in book section 5.7.

export const starter = `// img is a pixel map: an array of rows, each an array of colour numbers.

// 1) Flood fill: change the region containing pixel (i, j) to colour c, in place.
//    Return the number of pixels changed. Don't recurse: a big region would overflow the call stack.
function floodFill(img, i, j, c) {
  // your code here
}

// 2) The number of connected regions in the picture (without changing img).
function countRegions(img) {
  // your code here
}
`;

export const solution = `function floodFill(img, i, j, c) {
  const old = img[i][j];
  if (old === c) return 0;
  const bag = [[i, j]];
  let count = 0;
  while (bag.length) {
    const [a, b] = bag.pop();
    if (a < 0 || b < 0 || a >= img.length || b >= img[0].length || img[a][b] !== old) continue;
    img[a][b] = c;                   // the new colour is the mark
    count++;
    bag.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
  }
  return count;
}

function countRegions(img) {
  const copy = img.map((row) => row.slice());
  let regions = 0;
  for (let i = 0; i < copy.length; i++)
    for (let j = 0; j < copy[0].length; j++)
      if (copy[i][j] !== -1) { regions++; floodFill(copy, i, j, -1); }
  return regions;
}
`;

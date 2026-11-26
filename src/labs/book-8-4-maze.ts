// Starter and model-solution code for the lab in book section 8.4.

export const starter = `// A maze: an array of strings of equal length, '.' is open and '#' is a wall.
// Moves go up, down, left or right, one cell at a time, through open cells only.

// Return the fewest moves from the top-left cell to the bottom-right cell, or -1 if impossible.
// (Both corners are open.) This is breadth-first search on an implicit graph.
function mazeDistance(maze) {
  // your code here
}
`;

export const solution = `function mazeDistance(maze) {
  const R = maze.length, C = maze[0].length;
  const dist = Array.from({ length: R }, () => new Array(C).fill(Infinity));
  dist[0][0] = 0;
  const queue = [[0, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [i, j] = queue[head];
    for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (a < 0 || b < 0 || a >= R || b >= C || maze[a][b] === '#') continue;
      if (dist[a][b] > dist[i][j] + 1) {          // tense (in BFS: dist is still ∞)
        dist[a][b] = dist[i][j] + 1;
        queue.push([a, b]);
      }
    }
  }
  return dist[R - 1][C - 1] === Infinity ? -1 : dist[R - 1][C - 1];
}
`;

// Book 0.6: singing time, measured by running the song "algorithms" and counting what is sung.

export const GIFTS = [
  'a partridge in a pear tree', 'turtle doves', 'French hens', 'calling birds', 'gold rings', 'geese a-laying',
  'swans a-swimming', 'maids a-milking', 'ladies dancing', 'lords a-leaping', 'pipers piping', 'drummers drumming',
];

export interface SongCount { lines: number; mentions: number; gifts: number }

/** BottlesOfBeer(n): count the sung lines and how many times "beer" is sung. */
export function bottles(n: number): { lines: number; beer: number } {
  let lines = 0, beer = 0;
  for (let i = n; i >= 1; i--) { lines += 2; beer += 2 + 1; }
  lines += 2; beer += 2 + 1;
  return { lines, beer };
}

/** NDaysOfChristmas(n): sung lines, mentions of a gift (with the partridge), gifts received. */
export function christmas(n: number): SongCount {
  let lines = 0, mentions = 0, gifts = 0;
  for (let i = 1; i <= n; i++) {
    lines++;                                  // "On the i-th day ..."
    for (let j = i; j >= 2; j--) { lines++; mentions++; gifts += j; }
    if (i > 1) lines++;                       // "and"
    lines++; mentions++; gifts += 1;          // the partridge
  }
  return { lines, mentions, gifts };
}

/** The verses of NDaysOfChristmas, for display (only for small n). */
export function christmasVerses(n: number): string[][] {
  const ord = (i: number) => i + (i % 10 === 1 && i !== 11 ? 'st' : i % 10 === 2 && i !== 12 ? 'nd' : i % 10 === 3 && i !== 13 ? 'rd' : 'th');
  const out: string[][] = [];
  for (let i = 1; i <= n; i++) {
    const v = [`On the ${ord(i)} day of Christmas, my true love gave to me`];
    for (let j = i; j >= 2; j--) v.push(`${j} ${GIFTS[(j - 1) % GIFTS.length]},`);
    if (i > 1) v.push('and');
    v.push(`${GIFTS[0]}.`);
    out.push(v);
  }
  return out;
}

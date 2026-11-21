// Euclid's proof that there are infinitely many primes, run as an algorithm:
// given any finite list of primes, build N = (product) + 1 and find a prime factor of N.
// That factor can't be in the list, so the list was never "all the primes".

export interface EuclidFrame {
  line: number;
  product: bigint;
  used: number; // how many primes of the list are multiplied in so far
  N?: bigint;
  d?: bigint; // divisor being tried
  rem?: bigint; // N mod d
  factor?: bigint;
  skipped?: number; // trial divisions summarised in one frame
  tries: number;
  note: string;
}

export const EUCLID_PSEUDO = [
  'NEW-PRIME(p₁, …, pₖ):',
  '  P ← p₁ · p₂ · … · pₖ',
  '  N ← P + 1',
  '  for d ← 2, 3, 5, 7, 9, … :   // 2, then odd d',
  '    if N mod d = 0: return d   // smallest factor of N',
  '  // d is prime, and d divides N but no pᵢ does:',
  '  // so d is a prime missing from the list',
];

/** The smallest factor (> 1) of n, by trial division up to √n. */
export function smallestFactor(n: bigint): bigint {
  if (n % 2n === 0n) return 2n;
  for (let d = 3n; d * d <= n; d += 2n) if (n % d === 0n) return d;
  return n;
}

/** Frames of the algorithm. Trial divisions beyond the first `show` are summarised in one frame. */
export function* euclid(primes: number[], show = 24): Generator<EuclidFrame> {
  let P = 1n;
  let tries = 0;
  yield { line: 1, product: P, used: 0, tries, note: `القائمة: ${primes.join('، ')}` };
  for (let k = 0; k < primes.length; k++) {
    P *= BigInt(primes[k]);
    yield { line: 2, product: P, used: k + 1, tries, note: `نضرب في ${primes[k]}: P = ${P}` };
  }
  const N = P + 1n;
  yield { line: 3, product: P, used: primes.length, N, tries, note: `N = P + 1 = ${N}` };

  const f = smallestFactor(N);
  // the divisors trial division actually tries: 2, then odd numbers
  const seq: bigint[] = [];
  for (let d = 2n; d <= f && seq.length < show; d = d === 2n ? 3n : d + 2n) seq.push(d);
  for (const d of seq) {
    tries++;
    const rem = N % d;
    if (rem === 0n) {
      yield { line: 4, product: P, used: primes.length, N, d, rem, factor: d, tries, note: `${N} ÷ ${d}: الباقي 0. وجدنا عاملًا!` };
      break;
    }
    const inList = primes.includes(Number(d));
    yield {
      line: 4, product: P, used: primes.length, N, d, rem, tries,
      note: `${N} ÷ ${d}: الباقي ${rem}${inList ? ` — وهذا متوقع: ${d} في القائمة، فهو يقسم P، فالباقي من قسمة P + 1 عليه هو 1` : ''}`,
    };
  }
  const last = seq[seq.length - 1];
  if (last !== f) {
    // summarise the rest of the search
    const rest = Number((f - last) / 2n);
    tries += rest;
    yield { line: 4, product: P, used: primes.length, N, d: f, rem: 0n, factor: f, skipped: rest, tries, note: `بعد ${rest.toLocaleString('en')} قسمة أخرى: ${N} ÷ ${f} الباقي 0${f === N ? ' — أي أن N نفسه أولي' : ''}` };
  }
  yield { line: 6, product: P, used: primes.length, N, factor: f, tries, note: `${f} عدد أولي ليس في القائمة.` };
}

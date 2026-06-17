/* Small randomness helpers used across games. */

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick one random element (throws on empty). */
export function pickOne<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error('pickOne: empty array')
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Take up to `n` distinct random elements. */
export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.max(0, n))
}

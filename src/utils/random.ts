export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const randomBigInt = (max: bigint): bigint => {
  const randBig = BigInt(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()))
  const maxBig = BigInt(Number.MAX_SAFE_INTEGER)
  return (max * randBig) / maxBig
}

/**
 * Returns a random integer from `0` (included) to `max` (excluded).
 */
export const randomInteger = (max: number): number => {
  return Math.floor(Math.random() * max)
}

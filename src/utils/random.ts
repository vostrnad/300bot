export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const randomBigInt = (max: bigint): bigint => {
  const randBig = BigInt(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()))
  const maxBig = BigInt(Number.MAX_SAFE_INTEGER)
  return (max * randBig) / maxBig
}

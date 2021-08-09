/**
 * Divide without fearing division by zero.
 */
export const divide = (a: number, b: number, decimals?: number): number => {
  let res
  if (b === 0) {
    res = a
  } else {
    res = a / b
  }
  if (decimals !== undefined) {
    res = Number(res.toFixed(decimals))
  }
  return res
}

/**
 * Rounds a number to the nearest integer if it is close to it.
 */
export const roundIfClose = (n: number, eps = 1e-12): number => {
  const rounded: number = Math.round(n)
  const distance: number = Math.abs(n - rounded)
  if (distance < eps) {
    return rounded
  } else {
    return n
  }
}

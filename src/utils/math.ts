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

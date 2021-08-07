/**
 * Divide without fearing division by zero.
 */
export const divide = (a: number, b: number): number => {
  if (b === 0) {
    return a
  }
  return a / b
}

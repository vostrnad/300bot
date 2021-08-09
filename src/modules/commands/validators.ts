import { ArgumentNumberError, ArgumentRangeError } from '@app/errors'

export const validateArgumentNumber = (
  actual: number,
  required: number,
): void => {
  if (actual !== required) {
    throw new ArgumentNumberError(actual, required)
  }
}

export const validateArgumentRange = (
  actual: number,
  min?: number,
  max?: number,
): void => {
  if (
    (min !== undefined && actual < min) ||
    (max !== undefined && actual > max)
  ) {
    throw new ArgumentRangeError(actual, min, max)
  }
}

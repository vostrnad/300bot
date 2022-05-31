import {
  ArgumentNumberError,
  ArgumentRangeError,
  DefaultOutfitIdNotSetError,
} from '@app/errors'

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

export const validateDefaultOutfitId: (
  outfitId: string | undefined,
  prefix: string,
) => asserts outfitId is string = (outfitId, prefix) => {
  if (!outfitId) {
    throw new DefaultOutfitIdNotSetError(prefix)
  }
}

import { pluralize } from '@app/utils/language'

export class CustomError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class ArgumentRangeError extends CustomError {
  constructor(actual: number, min?: number, max?: number) {
    if (min !== undefined && max !== undefined) {
      if (min === max) {
        super(`Expected ${min} ${pluralize(min, 'argument')} but got ${actual}`)
      } else {
        super(`Expected ${min}-${max} arguments but got ${actual}`)
      }
    } else if (min !== undefined) {
      super(
        `Expected at least ${min} ${pluralize(
          min,
          'argument',
        )} but got ${actual}`,
      )
    } else if (max !== undefined) {
      super(
        `Expected at most ${max} ${pluralize(
          max,
          'argument',
        )} but got ${actual}`,
      )
    } else {
      super('Wrong number of arguments')
    }
  }
}

export class ArgumentNumberError extends ArgumentRangeError {
  constructor(actual: number, required: number) {
    super(actual, required, required)
  }
}

export class InvalidPlayerNameError extends CustomError {
  constructor() {
    super('Player names can only contain alphanumeric characters')
  }
}

export class PlayerNotFoundError extends CustomError {
  constructor() {
    super('There is no PlanetSide 2 character with this name')
  }
}

export class CensusApiUnavailableError extends CustomError {
  constructor() {
    super('Daybreak API is currently unavailable')
  }
}

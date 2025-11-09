import { InvalidOutfitAliasError, InvalidPlayerNameError } from '@app/errors'

export const validatePlayerName = (name: string): void => {
  if (!/^[\dA-Za-z]+$/.test(name)) {
    throw new InvalidPlayerNameError()
  }
}

export const validateOutfitAlias = (alias: string): void => {
  if (!/^[\dA-Za-z]+$/.test(alias)) {
    throw new InvalidOutfitAliasError()
  }
}

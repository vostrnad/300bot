import { InvalidOutfitAliasError, InvalidPlayerNameError } from '@app/errors'

export const validatePlayerName = (name: string): void => {
  if (!/^[a-zA-Z0-9]+$/.test(name)) {
    throw new InvalidPlayerNameError()
  }
}

export const validateOutfitAlias = (alias: string): void => {
  if (!/^[a-zA-Z0-9]+$/.test(alias)) {
    throw new InvalidOutfitAliasError()
  }
}

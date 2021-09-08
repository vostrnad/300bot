type ContinentName = 'Indar' | 'Hossin' | 'Amerish' | 'Esamir'
type FactionName =
  | 'Vanu Sovereignty'
  | 'New Conglomerate'
  | 'Terran Republic'
  | 'NS Operatives'
type FactionAlias = 'VS' | 'NC' | 'TR' | 'NSO'

const factions: Record<string, FactionName | undefined> = {
  '1': 'Vanu Sovereignty',
  '2': 'New Conglomerate',
  '3': 'Terran Republic',
  '4': 'NS Operatives',
}

export const getFactionName = (factionId: string): FactionName | null => {
  return factions[factionId] || null
}

const continents: Record<string, ContinentName | undefined> = {
  '2': 'Indar',
  '4': 'Hossin',
  '6': 'Amerish',
  '8': 'Esamir',
}

export const getContinentName = (continentId: string): ContinentName | null => {
  return continents[continentId] || null
}

const alertTypes: Record<string, [ContinentName, FactionAlias] | undefined> = {
  '147': ['Indar', 'TR'],
  '148': ['Indar', 'VS'],
  '149': ['Indar', 'NC'],
  '150': ['Esamir', 'TR'],
  '151': ['Esamir', 'VS'],
  '152': ['Esamir', 'NC'],
  '153': ['Hossin', 'TR'],
  '154': ['Hossin', 'VS'],
  '155': ['Hossin', 'NC'],
  '156': ['Amerish', 'TR'],
  '157': ['Amerish', 'VS'],
  '158': ['Amerish', 'NC'],
}

export const getAlertType = (
  metagameEventId: string,
): [ContinentName, FactionAlias] | null => {
  return alertTypes[metagameEventId] || null
}

const alertStates: Record<string, 'started' | 'ended' | undefined> = {
  '135': 'started',
  '138': 'ended',
}

export const getAlertState = (
  metagameEventStateId: string,
): 'started' | 'ended' | null => {
  return alertStates[metagameEventStateId] || null
}

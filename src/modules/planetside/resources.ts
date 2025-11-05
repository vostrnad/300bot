type ContinentName = 'Indar' | 'Hossin' | 'Amerish' | 'Esamir' | 'Oshur'
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
  '344': 'Oshur',
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
  '222': ['Oshur', 'NC'],
  '223': ['Oshur', 'TR'],
  '224': ['Oshur', 'VS'],
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

const servers = {
  '1': 'Osprey',
  '10': 'Wainwright',
  '19': 'Jaeger',
  '24': 'Apex',
  '25': 'Briggs',
  '40': 'SolTech',
} as const

export const getServerByName = (
  input: string,
): [id: number, name: string] | null => {
  input = input.toLowerCase()

  for (const [id, name] of Object.entries(servers)) {
    if (name.toLowerCase() === input) {
      return [Number(id), name]
    }
  }

  return null
}

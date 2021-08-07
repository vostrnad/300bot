const factions: Record<string, string | undefined> = {
  '1': 'Vanu Sovereignty',
  '2': 'New Conglomerate',
  '3': 'Terran Republic',
  '4': 'NS Operatives',
}

export const getFactionName = (factionId: string): string | null => {
  return factions[factionId] || null
}

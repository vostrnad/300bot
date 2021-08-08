export type Character = {
  characterId: string
  name: {
    first: string
    firstLower: string
  }
  factionId: string
  titleId: string
  times: {
    creation: string
    lastLogin: string
    minutesPlayed: string
  }
  battleRank: {
    value: string
  }
  prestigeLevel: string
  certs: {
    earnedPoints: string
    giftedPoints: string
    spentPoints: string
    availablePoints: string
    percentToNext: string
  }
}

export type CharactersOnlineStatus = {
  characterId: string
  onlineStatus: string
}

export type Outfit = {
  outfitId: string
  name: string
  nameLower: string
  alias: string
  aliasLower: string
  timeCreated: string
  leaderCharacterId: string
  memberCount: string
}

export type OutfitMember = {
  outfitId: string
  characterId: string
  memberSince: string
  rank: string
  rankOrdinal: string
}

export type Title = {
  titleId: string
  name: { en: string }
}

export type World = {
  worldId: string
  name: { en: string }
}

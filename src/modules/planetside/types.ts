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
}

export type CharacterResolvedOutfitMemberExtended = {
  outfitMember?: {
    leaderCharacterId: string
    name: string
    alias: string
    memberSince: string
  }
}

export type CharacterResolvedStatHistory = {
  stats?: {
    statHistory: Array<{
      allTime: string
      month: {
        m01: string
        m02: string
        m03: string
        m04: string
        m05: string
        m06: string
        m07: string
        m08: string
        m09: string
        m10: string
        m11: string
        m12: string
      }
    }>
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

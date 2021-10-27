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

export type CharacterName = {
  characterId: string
  name: {
    first: string
    firstLower: string
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

export type CharacterStatHistoryStripped = {
  characterId: string
  character: {
    prestigeLevel: string
    name: {
      first: string
    }
    times: {
      lastLogin: string
      minutesPlayed: string
    }
    stats: Array<{
      statName: string
      allTime: string
    }>
  }
}

export type OutfitMemberStats = {
  members: Array<{
    characterId: string
    character: {
      prestigeLevel: string
      name: {
        first: string
      }
      times: {
        lastLogin: string
        minutesPlayed: string
      }
      stats: Array<{
        statName: string
        allTime: string
      }>
    }
  }>
}

export type OutfitLeader = {
  leader: {
    name: {
      first: string
    }
    factionId: string
  }
}

export type DirectiveTreeCategory = {
  name: {
    en: string
  }
}

export type PlayerDirective = {
  directiveTreeCategoryId: string
  name: {
    en: string
  }
  directiveTree: Array<{
    directiveTreeId: string
    name: {
      en: string
    }
    directiveTier: Array<{
      directiveTierId: string
      completionTime: string
    }>
  }>
}

export type CharactersItem = {
  characterId: string
  itemId: string
}

export type Item = {
  itemId: string
  itemTypeId: string
  itemCategoryId: string
  isVehicleWeapon: string
  name: {
    en: string
  }
  description: {
    en: string
  }
  factionId: string
  maxStackSize: string
  imageSetId: string
  imageId: string
  imagePath: string
  isDefaultAttachment: string
}

export type CharacterWeaponStats = {
  characterId: string
  statName: string
  itemId: string
  vehicleId: string
  value: string
  lastSave: string
  lastSaveDate: string
}

export type CharacterWeaponStatsByFaction = {
  characterId: string
  statName: string
  itemId: string
  vehicleId: string
  valueVs: string
  valueNc: string
  valueTr: string
  lastSave: string
  lastSaveDate: string
}

export type FullCharacterWeaponStats = {
  characterId: string
  itemId: string
  item: Item
  weaponStatsByFaction: CharacterWeaponStatsByFaction[]
  weaponStats: CharacterWeaponStats[]
}

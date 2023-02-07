import { Character, CharacterWithOutfitWithLeader } from '@planetside/types'

const factionEmojis = [
  'Unknown Faction',
  '{emoji:faction_logo_vs|VS}',
  '{emoji:faction_logo_nc|NC}',
  '{emoji:faction_logo_tr|TR}',
  '{emoji:faction_logo_ns|NS}',
]

export const formatChacarcterWithFaction = (
  character: Character | CharacterWithOutfitWithLeader,
): string => {
  return `**${character.name.first}** ${
    factionEmojis[Number(character.factionId)]
  }${
    character.factionId === '4' &&
    'outfitMember' in character &&
    character.outfitMember
      ? ` ${
          factionEmojis[Number(character.outfitMember.outfit.leader.factionId)]
        }`
      : ''
  }`
}

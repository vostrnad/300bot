import discord from 'discord.js'
import { CharacterWithOutfitWithLeader } from '@planetside/types'
import { formatWithEmojis } from './utils'

export const factionEmojis = [
  'Unknown Faction',
  '{emoji:faction_logo_vs|VS}',
  '{emoji:faction_logo_nc|NC}',
  '{emoji:faction_logo_tr|TR}',
  '{emoji:faction_logo_ns|NS}',
]

export const displayCharacter = (
  character: CharacterWithOutfitWithLeader,
  channel: discord.Channel | null,
): string => {
  return formatWithEmojis(
    channel,
    `**${character.name.first}** ${factionEmojis[Number(character.factionId)]}${
      character.factionId === '4' && character.outfitMember
        ? ` ${
            factionEmojis[
              Number(character.outfitMember.outfit.leader.factionId)
            ]
          }`
        : ''
    }`,
  )
}

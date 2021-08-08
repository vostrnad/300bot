import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@app/modules/planetside/CensusApi'
import { getEmoji } from '@app/modules/discord/utils'
import { divide } from '@app/utils/math'
import { getShortDate } from '@app/utils/time'

export default new Command<discord.Message>({
  keyword: 'playerstats',
  description: 'show PS2 player stats',
  help: "Usage: `{prefix}playerstats <player name>` - shows player's PlanetSide 2 stats",
  callback: async ({ args, reply, raw, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    if (args.length > 1) {
      return reply('Player names cannot contain any spaces.')
    }
    const characterName = args[0].toLowerCase()
    const character = await censusApi.getDetailedCharacterByName(characterName)
    if (character === null) {
      return reply('There is no PlanetSide 2 character with this name.')
    }
    if (character.battleRank === '0') {
      return reply(
        `The character **${character.name}** exists but is invalid. No stats available.`,
      )
    }
    const headerData = []
    if (character.outfit?.alias) headerData.push(`[${character.outfit.alias}]`)
    if (character.title) headerData.push(character.title)
    headerData.push(character.name)

    reply(
      `__**${headerData.join(' ')}**__\n\nBattle Rank**${
        character.prestigeLevel !== '0'
          ? getEmoji(raw.channel, 'asp')?.toString() || ' ☆'
          : ' '
      }${character.battleRank}** | KDR **${divide(
        Number(character.kills),
        Number(character.deaths),
      ).toFixed(3)}** | SPM **${divide(
        Number(character.score),
        Number(character.minutesPlayed),
      ).toFixed(0)}**\n\nFighting for ${character.faction || 'unknown'} on ${
        character.world || 'unknown'
      } server since ${getShortDate(
        new Date(Number(character.creation) * 1000),
      )}.\n${
        character.outfit
          ? `${
              character.outfit.isLeader ? 'Leader' : 'Member'
            } of the outfit "${character.outfit.name}" since ${getShortDate(
              new Date(Number(character.outfit.memberSince) * 1000),
            )}.\n`
          : ''
      }Played for ${(Number(character.minutesPlayed) / 60).toFixed(
        0,
      )} hours in total${
        character.online ? ', currently online' : ''
      }.\nLast logged in on ${getShortDate(
        new Date(Number(character.lastLogin) * 1000),
      )}.`,
    )
  },
})

import { PlayerNotFoundError } from '@app/errors'
import { divide } from '@app/utils/math'
import { getShortDate } from '@app/utils/time'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { validatePlayerName } from '@planetside/validators'

export default new Command({
  keyword: 'playerstats',
  description: 'show PS2 player stats',
  help: "Usage: `{prefix}playerstats <player name>` - shows player's PlanetSide 2 stats",
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const characterName = args[0]
    validatePlayerName(characterName)
    const character = await censusApi.getDetailedCharacterByName(characterName)
    if (character === null) throw new PlayerNotFoundError()
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
        character.prestigeLevel !== '0' ? '{emoji:asp| ☆}' : ' '
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

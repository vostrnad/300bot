import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { validatePlayerName } from '@planetside/validators'
import { getEmoji } from '@discord/utils'

export default new Command<discord.Message>({
  keyword: 'certs',
  description: 'shows available certs of any player',
  help: 'Usage: `{prefix}certs <player name>` - shows available certs of any player',
  callback: async ({ args, reply, env, raw }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const characterName = args[0]
    validatePlayerName(characterName)
    const character = await censusApi.getCharacter({
      name: { firstLower: characterName.toLowerCase() },
    })
    if (character === null) {
      return reply('There is no PlanetSide 2 character with this name.')
    }
    reply(
      `**${character.name.first}** has ${character.certs.availablePoints} ${
        getEmoji(raw.channel, 'certification_point')?.toString() || ' certs'
      }.`,
    )
  },
})

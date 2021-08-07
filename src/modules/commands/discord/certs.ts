import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@app/modules/planetside/CensusApi'
import { getEmoji } from '@app/modules/discord/utils'

export default new Command<discord.Message>({
  keyword: 'certs',
  description: 'shows available certs of any player',
  help: 'Usage: `{prefix}certs <player name>` - shows available certs of any player',
  callback: async ({ args, reply, env, raw }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    if (args.length > 1) {
      return reply('Player names cannot contain any spaces.')
    }
    const characterName = args[0].toLowerCase()
    const character = await censusApi.getCharacterByName(characterName)
    if (character === null) {
      return reply('There is no PlanetSide 2 character with this name.')
    }
    reply(
      `**${character.name.first} has ${character.certs.availablePoints}${
        getEmoji(raw.channel, 'certification_point')?.toString() || 'certs'
      }.`,
    )
  },
})

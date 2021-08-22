import { sentence } from '@app/utils/language'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { validatePlayerName } from '@planetside/validators'

export default new Command({
  keyword: 'playersearch',
  description: 'find PlanetSide 2 players',
  help: 'Usage: `{prefix}playersearch [keywords]` - finds PlanetSide 2 players',
  options: {
    lastArgNumber: 1,
  },
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }

    const keywords = args[0].replace(/ +/, ' ').split(' ')

    keywords.forEach((keyword) => validatePlayerName(keyword))

    if (keywords.some((k) => k.length < 3)) {
      return reply('Error: Keywords must be at least 3 characters long.')
    }
    if (keywords.length > 5) {
      return reply('Error: You can only search with up to 5 keywords.')
    }

    const formattedKeywords = keywords.map((k) => `*${k.toLowerCase()}`)

    const characters = await censusApi.getList(
      'characterName',
      {
        name: { firstLower: formattedKeywords },
      },
      { limit: '25' },
    )

    if (characters.length === 0) {
      return reply('No characters found.')
    }

    const formattedNames = characters
      .sort((a, b) => Intl.Collator().compare(a.name.first, b.name.first))
      .map((character) => `**${character.name.first}**`)

    if (characters.length > 24) {
      return reply(
        `Characters found: ${formattedNames.slice(0, 20).join(', ')}...`,
      )
    } else {
      return reply(`Characters found: ${sentence(formattedNames)}.`)
    }
  },
})

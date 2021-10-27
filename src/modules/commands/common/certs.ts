import { PlayerNotFoundError } from '@app/errors'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { validatePlayerName } from '@planetside/validators'

export default new Command({
  keyword: 'certs',
  description: "show player's available certs",
  help: "Usage: `{prefix}certs <player name>` - shows player's available certs",
  category: 'Basic',
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const characterName = args[0]
    validatePlayerName(characterName)
    const character = await censusApi.getCharacter({
      name: { firstLower: characterName.toLowerCase() },
    })
    if (character === null) throw new PlayerNotFoundError()

    reply(
      `**${character.name.first}** has ${character.certs.availablePoints} {emoji:certification_point|certs}.`,
    )
  },
})

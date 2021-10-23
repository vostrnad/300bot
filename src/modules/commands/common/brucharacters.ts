import { PlayerNotFoundError } from '@app/errors'
import { bruCharactersDatabase } from '@app/modules/database/brucharacters'
import { validatePlayerName } from '@app/modules/planetside/validators'
import { censusApi } from '@planetside/CensusApi'
import { Command } from '../CommandHandler'
import { validateArgumentRange, validateArgumentNumber } from '../validators'

export default new Command({
  keyword: 'brucharaters',
  description: "manage bru's characters",
  help: "Usage: `{prefix}brucharaters <list|add|remove>` - lists adds or removes bru's characters",
  callback: async ({ args, reply }) => {
    validateArgumentRange(args.length, 1, 2)
    switch (args[0]) {
      case 'add': {
        validateArgumentNumber(args.length, 2)
        validatePlayerName(args[1])
        const character = await censusApi.getCharacterName({
          name: { firstLower: args[0].toLowerCase() },
        })
        if (character === null) throw new PlayerNotFoundError()

        const characterId = character.characterId
        const characterName = character.name.first

        const dbPath = `${characterId}` as const

        if (bruCharactersDatabase.get(dbPath)) {
          return reply(
            `**${characterName}** is already in the list of Bru's characters.`,
          )
        } else {
          await bruCharactersDatabase.set(dbPath, 1)
        }

        break
      }
      case 'remove': {
        validateArgumentNumber(args.length, 2)
        break
      }
      case 'list':
        break
      default:
    }
  },
})

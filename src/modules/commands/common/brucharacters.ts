import { PlayerNotFoundError } from '@app/errors'
import { bruCharactersDatabase } from '@app/modules/database/brucharacters'
import { validatePlayerName } from '@app/modules/planetside/validators'
import { sentence } from '@app/utils/language'
import { censusApi } from '@planetside/CensusApi'
import { Command } from '../CommandHandler'
import { validateArgumentRange, validateArgumentNumber } from '../validators'

export default new Command({
  keyword: 'brucharacters',
  description: "manage bru's characters",
  help: "Usage: `{prefix}brucharaters <add|remove|list>` - lists adds or removes bru's characters",
  callback: async ({ args, reply, env }) => {
    validateArgumentRange(args.length, 1, 2)

    switch (args[0]) {
      case 'add': {
        validateArgumentNumber(args.length, 2)
        validatePlayerName(args[1])
        const character = await censusApi.getCharacterName({
          name: { firstLower: args[1].toLowerCase() },
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
          return reply(
            `**${characterName}** has been added to the list of Bru's characters.`,
          )
        }
      }
      case 'remove': {
        validateArgumentNumber(args.length, 2)
        validatePlayerName(args[1])
        const character = await censusApi.getCharacterName({
          name: { firstLower: args[1].toLowerCase() },
        })
        if (character === null) throw new PlayerNotFoundError()

        const characterId = character.characterId
        const characterName = character.name.first

        const dbPath = `${characterId}` as const
        if (!bruCharactersDatabase.get(dbPath)) {
          return reply(
            `**${characterName}** is not listed as one of Bru's characters.`,
          )
        } else {
          await bruCharactersDatabase.delete(dbPath)
          return reply(
            `**${characterName}** has been removed from the list of Bru's characters.`,
          )
        }
      }
      case 'list': {
        const list = bruCharactersDatabase.root
        const characterIds = Object.keys(list)
        if (characterIds.length === 0) {
          return reply("The list of Bru's characters is empty")
        }
        characterIds.reverse() // Display by most recent addition first
        const characters = await censusApi.getPlayerNames(characterIds)
        const characterNames: string[] = []
        characterIds.forEach((id) => {
          characterNames.push(`**${characters[id].name.first}**`)
        })
        const message =
          'Here is the list of all known Bru characters:\n' +
          sentence(characterNames)

        return reply(message)
      }

      default: {
        return reply(env.command.getHelp(env.handler))
      }
    }
  },
})

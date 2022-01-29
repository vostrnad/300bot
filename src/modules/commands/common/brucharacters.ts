import { PlayerNotFoundError } from '@app/errors'
import { sentence } from '@app/utils/language'
import { Command } from '@commands/CommandHandler'
import {
  validateArgumentNumber,
  validateArgumentRange,
} from '@commands/validators'
import { bruCharactersDatabase } from '@database/brucharacters'
import { censusApi } from '@planetside/CensusApi'
import { validatePlayerName } from '@planetside/validators'

export default new Command({
  keyword: 'brucharacters',
  description: "manage Bru's characters",
  help: "Usage: `{prefix}brucharacters <add|remove|list>` - lists adds or removes Bru's characters",
  callback: async ({ args, reply, env, author }) => {
    validateArgumentRange(args.length, 1, 2)

    switch (args[0]) {
      case 'add': {
        if (!author.admin) {
          return reply('You are not an admin or a bot operator in this server.')
        }
        validateArgumentNumber(args.length, 2)
        validatePlayerName(args[1])
        const character = await censusApi.getCharacterName({
          name: { firstLower: args[1].toLowerCase() },
        })
        if (character === null) throw new PlayerNotFoundError()

        const characterId = character.characterId
        const characterName = character.name.first

        const dbKey = characterId

        if (bruCharactersDatabase.has(dbKey)) {
          return reply(
            `**${characterName}** is already in the list of Bru's characters.`,
          )
        } else {
          await bruCharactersDatabase.set(dbKey, 1)
          return reply(
            `**${characterName}** has been added to the list of Bru's characters.`,
          )
        }
      }
      case 'remove': {
        if (!author.admin) {
          return reply('You are not an admin or a bot operator in this server.')
        }
        validateArgumentNumber(args.length, 2)
        validatePlayerName(args[1])
        const character = await censusApi.getCharacterName({
          name: { firstLower: args[1].toLowerCase() },
        })
        if (character === null) throw new PlayerNotFoundError()

        const characterId = character.characterId
        const characterName = character.name.first

        const dbPath = `${characterId}` as const
        if (!bruCharactersDatabase.has(dbPath)) {
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
        const characterIds = bruCharactersDatabase.keys
        if (characterIds.length === 0) {
          return reply("The list of Bru's characters is empty.")
        }
        characterIds.reverse() // Display by most recent addition first
        const characters = await censusApi.getPlayerNames(characterIds)
        const characterNames = Object.values(characters).map((character) => {
          return `**${character.name.first}**`
        })
        const message =
          'Here is the list of all known Bru characters: ' +
          sentence(characterNames) +
          '.'

        return reply(message)
      }

      default: {
        return reply(env.command.getHelp(env.handler))
      }
    }
  },
})

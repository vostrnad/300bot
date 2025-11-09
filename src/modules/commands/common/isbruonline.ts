import { sentence } from '@app/utils/language'
import { Command } from '@commands/command-handler'
import { formatChacarcterWithFaction } from '@commands/formatting'
import { bruCharactersDatabase } from '@database/brucharacters'
import { censusApi } from '@planetside/census-api'

export default new Command({
  keyword: 'isbruonline',
  alias: ['isbruoffline'],
  description: 'check if Bru is online',
  help: 'Usage: `{prefix}isbruonline` - checks if Bru is online',
  callback: async ({ args, alias, reply }) => {
    if (args.length > 0) return

    const statuses =
      await censusApi.getCharactersWithOutfitLeaderAndOnlineStatus({
        characterId: bruCharactersDatabase.keys,
      })

    if (!statuses) {
      return reply('Bru has no existing characters.')
    }

    const formattedCharacters = statuses
      .filter((character) => character.onlineStatus !== '0')
      .map(formatChacarcterWithFaction)

    const online = formattedCharacters.length > 0
    if (alias === 'isbruonline') {
      return reply(
        online
          ? `Yes, Bru is online as ${sentence(formattedCharacters)}!`
          : 'No, Bru is offline.',
      )
    } else {
      return reply(
        online
          ? `No, Bru is online as ${sentence(formattedCharacters)}.`
          : 'Yes, Bru is offline!',
      )
    }
  },
})

import { sentence } from '@app/utils/language'
import { Command } from '@commands/CommandHandler'
import { DiscordParams } from '@commands/params'
import { validateArgumentNumber } from '@commands/validators'
import { bruCharactersDatabase } from '@database/brucharacters'
import { displayCharacter } from '@discord/resources'
import { censusApi } from '@planetside/CensusApi'
import { TestDiscordParams } from '@test/utils/commands'

export default new Command<DiscordParams | TestDiscordParams>({
  keyword: 'isbruonline',
  alias: ['isbruoffline'],
  description: 'check if Bru is online',
  help: 'Usage: `{prefix}isbruonline` - checks if Bru is online',
  callback: async ({ args, alias, reply, env }) => {
    validateArgumentNumber(args.length, 0)

    const statuses =
      await censusApi.getCharacterOutfitLeaderFactionAndOnlineStatus({
        characterId: bruCharactersDatabase.keys.join(','),
      })

    if (!statuses) {
      return reply(
        'Bru has no existing characters, please verify using the brucharacters command',
      )
    }
    const channelOpt = env.message ? env.message.channel : null

    const characterList = statuses
      .filter((c) => c.onlineStatus === '10')
      .map((c) => `${displayCharacter(c, channelOpt)}`)

    const online = characterList.length > 0
    if (alias === 'isbruonline') {
      return reply(
        online
          ? `Yes, Bru is online as ${sentence(characterList)}!`
          : 'No, Bru is offline.',
      )
    } else {
      return reply(
        online
          ? `No, Bru is online as ${sentence(characterList)}.`
          : 'Yes, Bru is offline!',
      )
    }
  },
})

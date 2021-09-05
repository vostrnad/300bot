import { constants } from '@app/global/constants'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'

export default new Command({
  keyword: 'isbruonline',
  alias: ['isbruoffline'],
  description: 'check if Bru is online',
  help: 'Usage: `{prefix}isbruonline` - checks if Bru is online',
  callback: async ({ args, alias, reply }) => {
    if (args.length > 0) return

    const status = await censusApi.getCharactersOnlineStatus(
      constants.planetside.characterIds.bru,
    )

    if (status === null) {
      return reply('Bru has deleted this character.')
    }
    if (alias === 'isbruonline') {
      return reply(status ? 'Yes, Bru is online!' : 'No, Bru is offline.')
    } else {
      return reply(status ? 'No, Bru is online.' : 'Yes, Bru is offline!')
    }
  },
})

import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { constants } from '@app/global/constants'
import { sentence } from '@app/utils/language'

export default new Command({
  keyword: 'whoisonline',
  description: 'check who is online',
  help: 'Usage: `{prefix}whoisonline` - checks who is online',
  callback: async ({ args, reply }) => {
    if (args.length > 0) return

    const names = await censusApi.getOnlineOutfitMembers(
      constants.planetside.outfitIds.spartans,
    )

    if (names.length === 0) {
      reply('No outfit members are online.')
    } else if (names.length === 1) {
      reply(`**${names[0]}** is the only online outfit member.`)
    } else {
      reply(
        `These ${names.length} outfit members are online: ${sentence(
          names.map((name) => `**${name}**`),
        )}`,
      )
    }
  },
})

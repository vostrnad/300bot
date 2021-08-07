import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { constants } from '@app/global/constants'

export default new Command({
  keyword: 'membercount',
  description: 'count the members of the outfit',
  help: 'Usage: `{prefix}membercount` - count the members of the outfit',
  callback: async ({ args, reply }) => {
    if (args.length > 0) return

    const memberCount = await censusApi.getOutfitMembersCount(
      constants.planetside.outfitIds.spartans,
    )
    if (memberCount === null)
      return reply('No outfit corresponds to this request.')
    reply(`There are ${memberCount} members in the outfit.`)
  },
})

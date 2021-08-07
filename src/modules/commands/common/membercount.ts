import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { constants } from '@app/global/constants'

export default new Command({
  keyword: 'membercount',
  description: 'count the members of the outfit',
  help: 'Usage:\n`{prefix}membercount` - count the members of the outfit\n`{prefix}membercount <alias>` - count the members of any outfit by alias',
  callback: async ({ args, reply }) => {
    if (args.length > 1) return reply('Error: too many arguments.')
    let outfit
    if (args.length === 0) {
      outfit = await censusApi.getOutfit({
        outfitId: constants.planetside.outfitIds.spartans,
      })
    } else {
      outfit = await censusApi.getOutfit({
        aliasLower: args[0].toLowerCase(),
      })
    }

    if (outfit === null) return reply('No outfit corresponds to this request.')
    reply(`The outfit ${outfit.name} have ${outfit.memberCount} members.`)
  },
})

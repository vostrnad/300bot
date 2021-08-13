import { Command } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { constants } from '@app/global/constants'

export default new Command({
  keyword: 'membercount',
  description: 'count outfit members',
  help: 'Usage:\n`{prefix}membercount` - counts outfit members\n`{prefix}membercount <alias>` - counts members of the specified outfit',
  callback: async ({ args, reply }) => {
    validateArgumentRange(args.length, 0, 1)
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

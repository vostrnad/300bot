import { Command } from '@commands/CommandHandler'
import { SettingsParams } from '@commands/params'
import {
  validateArgumentRange,
  validateDefaultOutfitId,
} from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'

export default new Command<SettingsParams>({
  keyword: 'membercount',
  description: 'count outfit members',
  help: 'Usage:\n`{prefix}membercount` - counts outfit members\n`{prefix}membercount <outfit tag>` - counts members of the specified outfit',
  callback: async ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 1)
    let outfit
    if (args.length === 0) {
      validateDefaultOutfitId(env.settings.outfitId, env.handler.prefix)

      outfit = await censusApi.getOutfit({
        outfitId: env.settings.outfitId,
      })
    } else {
      outfit = await censusApi.getOutfit({
        aliasLower: args[0].toLowerCase(),
      })
    }

    if (outfit === null) return reply('No outfit corresponds to this request.')
    reply(`The outfit **${outfit.name}** has ${outfit.memberCount} members.`)
  },
})

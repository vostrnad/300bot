import { OutfitAliasNotFoundError } from '@app/errors'
import { Command } from '@commands/command-handler'
import { SettingsParams } from '@commands/params'
import { validateArgumentNumber } from '@commands/validators'
import { censusApi } from '@planetside/census-api'

export default new Command<SettingsParams>({
  keyword: 'setoutfit',
  description: 'set default outfit',
  help: 'Usage: `{prefix}setoutfit <outfit tag>` - sets default outfit',
  callback: async ({ args, author, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)

    if (!author.permissions.localAdmin) {
      return reply('You are not an admin in this server.')
    }

    const outfit = await censusApi.getOutfit({
      aliasLower: args[0].toLowerCase(),
    })
    if (outfit === null) throw new OutfitAliasNotFoundError()

    if (outfit.outfitId === env.settings.outfitId) {
      return reply(`**${outfit.name}** is already set as the default outfit.`)
    }

    await env.updateSettings('outfitId', outfit.outfitId)

    reply(`**${outfit.name}** has been set as the default outfit.`)
  },
})

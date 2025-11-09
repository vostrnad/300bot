import { OutfitAliasNotFoundError } from '@app/errors'
import { sentence } from '@app/utils/language'
import { Command } from '@commands/command-handler'
import { SettingsParams } from '@commands/params'
import {
  validateArgumentRange,
  validateDefaultOutfitId,
} from '@commands/validators'
import { censusApi } from '@planetside/census-api'
import { validateOutfitAlias } from '@planetside/validators'

export default new Command<SettingsParams>({
  keyword: 'whoisonline',
  description: 'check who is online',
  help: 'Usage:\n`{prefix}whoisonline` - checks who is online\n`{prefix}whoisonline <outfit tag>` - list online members of a specific outfit',
  callback: async ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 1)

    if (args.length === 0) {
      validateDefaultOutfitId(env.settings.outfitId, env.handler.prefix)

      const names = await censusApi.getOnlineOutfitMembers(
        env.settings.outfitId,
      )

      if (names.length === 0) {
        reply('No outfit members are online.')
      } else if (names.length === 1) {
        reply(`**${names[0]}** is the only online outfit member.`)
      } else {
        reply(
          `These ${names.length} outfit members are online: ${sentence(
            names.map((name) => `**${name}**`),
          )}.`,
        )
      }
    } else {
      const alias = args[0]
      validateOutfitAlias(alias)
      const outfit = await censusApi.getOutfit({
        aliasLower: alias.toLowerCase(),
      })
      if (!outfit) throw new OutfitAliasNotFoundError()
      const names = await censusApi.getOnlineOutfitMembers(outfit.outfitId)

      if (names.length === 0) {
        reply(`No members of **${outfit.name}** are online.`)
      } else if (names.length === 1) {
        reply(
          `**${names[0]}** is the only online member of **${outfit.name}**.`,
        )
      } else {
        reply(
          `These ${names.length} members of **${
            outfit.name
          }** are online: ${sentence(names.map((name) => `**${name}**`))}.`,
        )
      }
    }
  },
})

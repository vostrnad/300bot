import { OutfitAliasNotFoundError } from '@app/errors'
import { constants } from '@app/global/constants'
import { sentence } from '@app/utils/language'
import { Command } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { validateOutfitAlias } from '@planetside/validators'

export default new Command({
  keyword: 'whoisonline',
  description: 'check who is online',
  help: 'Usage:\n`{prefix}whoisonline` - checks who is online\n`{prefix}whoisonline <outfit tag>` - list online members of a specific outfit',
  category: 'Basic',
  callback: async ({ args, reply }) => {
    validateArgumentRange(args.length, 0, 1)

    if (args.length === 0) {
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

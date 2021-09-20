import { OutfitAliasNotFoundError } from '@app/errors'
import { constants } from '@app/global/constants'
import { censusApi } from '@app/modules/planetside/CensusApi'
import { divide } from '@app/utils/math'
import { getShortDate } from '@app/utils/time'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '../validators'

export default new Command({
  keyword: 'whotokick',
  description: 'show players that can be kicked from the outfit',
  help: 'Usage:`{prefix}whotokick` - shows a list of players that can be kicked from the outfit',
  callback: async ({ args, reply }) => {
    validateArgumentNumber(args.length, 0)
    if (args.length > 0) return

    let memberStats = await censusApi.getOutfitMembersStatsById(
      constants.planetside.outfitIds.spartans,
    )

    if (memberStats === null) throw new OutfitAliasNotFoundError()

    memberStats = memberStats.filter((outfitMember) => {
      return (
        typeof outfitMember.character !== 'undefined' &&
        typeof outfitMember.character.stats[8] !== 'undefined'
      )
    })

    const inactiveThreshold = 2 * 30.5 * 24 * 3600 // 2 months
    const kdrThreshold = 0.4
    const spmThreshold = 20
    const brThreshold = 16
    const strikeThreshold = 2

    let message = ''

    memberStats = memberStats.filter((member) => {
      let strikes = 0
      let messageLine = `**${member.character.name.first}**:\n`
      // Inactivity
      if (
        Number(member.character.times.lastLogin) <
        Date.now() / 1000 - inactiveThreshold
      ) {
        messageLine += `- Inactive since ${getShortDate(
          new Date(Number(member.character.times.lastLogin) * 1000),
        )}\n`
        strikes += 2
      }
      // KDR
      const kdr = divide(
        Number(member.character.stats[5].allTime),
        Number(member.character.stats[2].allTime),
      )
      if (kdr < kdrThreshold) {
        messageLine += `- KDR only ${kdr.toFixed(3)}\n`
        strikes += 1
      }
      // SPM
      const spm = divide(
        Number(member.character.stats[8].allTime),
        Number(member.character.times.minutesPlayed),
      )
      if (spm < spmThreshold) {
        messageLine += `- SPM only ${spm.toFixed(3)}\n`
        strikes += 1
      }

      // Battle rank
      const br = Number(member.character.stats[0])
      if (br < brThreshold) {
        messageLine += `- Battle rank only ${br}\n`
        strikes += 1
      }

      // Check if we have enough strikes to kick this player
      if (strikes >= strikeThreshold) {
        message += messageLine
        return true
      }
      return false
    })

    return reply(message)
  },
})

import discord from 'discord.js'
import { OutfitAliasNotFoundError } from '@app/errors'
import { constants } from '@app/global/constants'
import { sendScrollEmbed } from '@app/modules/discord/embed'
import { censusApi } from '@app/modules/planetside/CensusApi'
import {
  CharacterStatHistoryStripped,
  OutfitMember,
} from '@app/modules/planetside/types'
import { pluralize } from '@app/utils/language'
import { divide } from '@app/utils/math'
import { getShortDate } from '@app/utils/time'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '../validators'

export default new Command<discord.Message>({
  keyword: 'whotokick',
  description: 'show players that can be kicked from the outfit',
  help: 'Usage:`{prefix}whotokick` - shows a list of players that can be kicked from the outfit',
  category: 'Advanced',
  callback: async ({ args, raw }) => {
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

    const message: string[] = []

    type AddInfo = { message?: string; strikes?: number }

    const membersToKick: Array<
      OutfitMember & CharacterStatHistoryStripped & AddInfo
    > = []

    memberStats.forEach((member) => {
      let strikes = 0
      let messageLine = ''
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
        message.push(messageLine)
        membersToKick.push(member)
        membersToKick[membersToKick.length - 1].message = messageLine
        membersToKick[membersToKick.length - 1].strikes = strikes
      }
    })

    membersToKick.sort((m1, m2) => {
      if (
        typeof m1.strikes === 'undefined' ||
        typeof m2.strikes === 'undefined'
      ) {
        return 0
      }

      if (m1.strikes > m2.strikes) return -1
      return 1
    })

    return sendScrollEmbed(raw, membersToKick, (member, idx, active) => {
      const kickEmbed = new discord.MessageEmbed()
        .setTitle(
          `**${member.character.name.first}** (${idx + 1}/${
            membersToKick.length
          })`,
        )
        .addField(
          `${pluralize(
            member.message?.match(/-/g)?.length || 1,
            'Reason',
            'Reasons',
          )} to kick`,
          member.message,
        )
        .setTimestamp()

      if (active) {
        kickEmbed.setFooter('Interactive').setColor('#647CC4')
      } else {
        kickEmbed.setFooter('Interaction ended').setColor('#1D2439')
      }
      return kickEmbed
    })
  },
})

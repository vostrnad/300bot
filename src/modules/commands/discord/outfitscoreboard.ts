import discord from 'discord.js'
import { OutfitAliasNotFoundError } from '@app/errors'
import { partition } from '@app/utils/array'
import { divide } from '@app/utils/math'
import { Command } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'
import { sendScrollEmbed } from '@discord/embed'
import { censusApi } from '@planetside/CensusApi'

export default new Command<discord.Message>({
  keyword: 'outfitscoreboard',
  description: 'show PS2 outfit player scoreboard',
  help: "Usage:\n`{prefix}outfitscoreboard <alias> <stat>` - shows an outfit's player scoreboard\n`{prefix}outfitstats <alias> <stat> shame` - shows an outfit's players scoreboard starting from the worst",
  callback: async ({ args, reply, raw, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentRange(args.length, 2, 3)

    const outfitAlias = args[0].toLowerCase()

    const linesPerDisplay = 15

    const columns = 2

    const acronyms = ['kdr', 'spm'] // Stats that will have a diplay name in full upper case

    const stat = acronyms.includes(args[1].toLowerCase())
      ? args[1].toUpperCase()
      : args[1]
          .replace(/\s+/g, ' ')
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
          .join(' ')

    const memberStats = await censusApi.getOutfitMembersStats(outfitAlias)
    if (memberStats === null) throw new OutfitAliasNotFoundError()

    memberStats.outfitMember = memberStats.outfitMember.filter(
      (outfitMember) => {
        return (
          typeof outfitMember.character !== 'undefined' &&
          typeof outfitMember.character.stats[8] !== 'undefined'
        )
      },
    )

    let scoreboard: typeof memberStats.outfitMember

    const displayScoreboard: string[] = []

    let shame = 0

    const supportedStats = ['playtime', 'spm', 'kdr', 'kills', 'deaths']

    if (args.length > 2) {
      switch (args[2]) {
        case 'shame':
          shame = 1
          break

        default:
          return reply(env.command.getHelp(env.handler))
          break
      }
    }

    switch (args[1].toLowerCase()) {
      case 'playtime':
        scoreboard = memberStats.outfitMember.sort((nerd1, nerd2) => {
          if (
            Number(nerd1.character.times.minutesPlayed) <
            Number(nerd2.character.times.minutesPlayed)
          ) {
            return 1
          } else return -1
        })

        scoreboard.forEach((outfitMember, idx) => {
          displayScoreboard.push(
            `**${idx + 1}** | ${divide(
              Number(outfitMember.character.times.minutesPlayed),
              60,
            ).toFixed(0)} hours - **${outfitMember.character.name.first}**`,
          )
        })

        break

      case 'spm':
        scoreboard = memberStats.outfitMember.sort(
          (goodPlayer1, goodPlayer2) => {
            if (
              divide(
                Number(goodPlayer1.character.stats[8].allTime),
                Number(goodPlayer1.character.times.minutesPlayed),
              ) <
              divide(
                Number(goodPlayer2.character.stats[8].allTime),
                Number(goodPlayer2.character.times.minutesPlayed),
              )
            ) {
              return 1
            } else return -1
          },
        )

        scoreboard.forEach((outfitMember, idx) => {
          displayScoreboard.push(
            `**${idx + 1}** | ${divide(
              Number(outfitMember.character.stats[8].allTime),
              Number(outfitMember.character.times.minutesPlayed),
            ).toFixed(0)} - **${outfitMember.character.name.first}**`,
          )
        })

        break

      case 'kdr':
        scoreboard = memberStats.outfitMember.sort((sweaty1, sweaty2) => {
          if (
            divide(
              Number(sweaty1.character.stats[5].allTime),
              Number(sweaty1.character.stats[2].allTime),
            ) <
            divide(
              Number(sweaty2.character.stats[5].allTime),
              Number(sweaty2.character.stats[2].allTime),
            )
          ) {
            return 1
          } else return -1
        })

        scoreboard.forEach((outfitMember, idx) => {
          displayScoreboard.push(
            `**${idx + 1}** | ${divide(
              Number(outfitMember.character.stats[5].allTime),
              Number(outfitMember.character.stats[2].allTime),
            ).toFixed(3)} - **${outfitMember.character.name.first}**`,
          )
        })
        break

      case 'kills':
        scoreboard = memberStats.outfitMember.sort((p1, p2) => {
          if (
            Number(p1.character.stats[5].allTime) <
            Number(p2.character.stats[5].allTime)
          ) {
            return 1
          } else return -1
        })

        scoreboard.forEach((outfitMember, idx) => {
          displayScoreboard.push(
            `**${idx + 1}** | ${Number(
              outfitMember.character.stats[5].allTime,
            )} - **${outfitMember.character.name.first}**`,
          )
        })

        break

      case 'deaths':
        scoreboard = memberStats.outfitMember.sort((p1, p2) => {
          if (
            Number(p1.character.stats[2].allTime) <
            Number(p2.character.stats[2].allTime)
          ) {
            return 1
          } else return -1
        })

        scoreboard.forEach((outfitMember, idx) => {
          displayScoreboard.push(
            `**${idx + 1}** | ${Number(
              outfitMember.character.stats[2].allTime,
            )} - **${outfitMember.character.name.first}**`,
          )
        })

        break

      default:
        return reply(
          `Provided stat ${
            args[2]
          } is unknown. Here is the list of supported stats:\n   ${supportedStats.join(
            '\n   ',
          )}`,
        )
    }

    if (shame) displayScoreboard.reverse()

    const pages = partition(displayScoreboard, linesPerDisplay * columns)

    return sendScrollEmbed(raw, pages, (page, index, active) => {
      const scoreboardEmbed = new discord.MessageEmbed()
        .setTitle(
          `**${memberStats.name}** - ${stat} ${
            shame === 1 ? 'shame' : ''
          } scoreboard  (Page N°${index + 1}/${pages.length})`,
        )
        .addField(stat, page.slice(0, page.length / 2).join('\n'), true)
        .addField(stat, page.slice(page.length / 2).join('\n'), true)
        .setTimestamp()

      if (active) {
        scoreboardEmbed.setFooter('Interactive').setColor('#647CC4')
      } else {
        scoreboardEmbed.setFooter('Interaction ended').setColor('#1D2439')
      }
      return scoreboardEmbed
    })
  },
})

import discord from 'discord.js'
import { floor } from 'mathjs'
import { OutfitAliasNotFoundError } from '@app/errors'
import { constants } from '@app/global/constants'
import { log } from '@app/utils/log'
import { divide, mod } from '@app/utils/math'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { validateArgumentRange } from '../validators'

export default new Command<discord.Message>({
  keyword: 'outfitscoreboard',
  description: 'show PS2 outfit player scoreboard',
  help: "Usage:\n`{prefix}outfitscoreboard <alias> <stat>` - shows an outfit's player scoreboard\n`{prefix}outfitstats <alias> <stat> shame` - shows an outfit's players scoreboard starting from the worst",
  callback: async ({ args, reply, raw, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentRange(args.length, 2, 3)

    const removeReaction = async (reaction: discord.MessageReaction) => {
      try {
        await reaction.users.remove(raw.author)
      } catch (error) {
        log.error('Error removing reaction:', error)
      }
    }

    const genScoreboardEmbed = (
      outfitName: string,
      displayArray: string[],
      stat: string,
      page: number,
      len: number,
    ): discord.MessageEmbed => {
      const scoreboardEmbed = new discord.MessageEmbed()
        .setColor('#647CC4')
        .setTitle(
          `**${outfitName}** - ${stat} ${
            shame === 1 ? 'shame' : ''
          } scoreboard  (Page N°${page + 1}/${len})`,
        )
        .addField(
          stat,
          displayArray.slice(0, displayArray.length / 2).join('\n'),
          true,
        )
        .addField(
          stat,
          displayArray.slice(displayArray.length / 2).join('\n'),
          true,
        )
        .setTimestamp()
        .setFooter('Interactive')
      return scoreboardEmbed
    }

    const outfitAlias = args[0].toLowerCase()

    const linesPerDisplay = 15

    const columns = 2

    const timeout = 10 * 60 * 1000 // 10 minutes

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
              return -1
            } else return 1
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
            return -1
          } else return 1
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
            return -1
          } else return 1
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
            return -1
          } else return 1
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

    let page = 0

    const scoreLen =
      floor(divide(displayScoreboard.length, linesPerDisplay * 2)) + 1

    let scoreboardEmbed = genScoreboardEmbed(
      memberStats.name,
      displayScoreboard.slice(
        linesPerDisplay * page * columns,
        (linesPerDisplay * page + linesPerDisplay) * columns,
      ),
      stat,
      page,
      scoreLen,
    )

    const embedMessage = await raw.channel.send({ embed: scoreboardEmbed })

    await embedMessage.react(constants.discord.emojis.arrowLeft)
    await embedMessage.react(constants.discord.emojis.arrowRight)

    const collector = embedMessage.createReactionCollector(
      (reaction: discord.MessageReaction, user: discord.User) =>
        [
          constants.discord.emojis.arrowLeft,
          constants.discord.emojis.arrowRight,
        ].includes(reaction.emoji.name) && user.id === raw.author.id,
      {
        time: timeout,
      },
    )

    collector.on('collect', (reaction: discord.MessageReaction) => {
      if (reaction.emoji.name === constants.discord.emojis.arrowRight) {
        page = mod(page + 1, scoreLen)
      }

      if (reaction.emoji.name === constants.discord.emojis.arrowLeft) {
        page = mod(page - 1, scoreLen)
      }

      void (async () => {
        await removeReaction(reaction)

        scoreboardEmbed = genScoreboardEmbed(
          memberStats.name,
          displayScoreboard.slice(
            linesPerDisplay * page * columns,
            (linesPerDisplay * page + linesPerDisplay) * columns,
          ),
          stat,
          page,
          scoreLen,
        )

        scoreboardEmbed.setTimestamp()
        await embedMessage.edit({ embed: scoreboardEmbed })
      })()
    })

    collector.on('end', () => {
      scoreboardEmbed
        .setFooter('Interaction ended')
        .setColor('#1D2439')
        .setTimestamp()
      void embedMessage.edit({ embed: scoreboardEmbed })
    })
  },
})

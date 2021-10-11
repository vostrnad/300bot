import { OutfitAliasNotFoundError } from '@app/errors'
import { divide } from '@app/utils/math'
import { Command } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'

export default new Command({
  keyword: 'outfitstats',
  description: 'show PS2 outfit stats',
  help: "Usage:\n`{prefix}outfitstats <alias>` - shows an outfit's players average stats\n`{prefix}outfitstats <alias> active` - shows an outfit's active players average stats",
  category: 'Advanced',
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentRange(args.length, 1, 2)

    const outfitAlias = args[0].toLowerCase()

    const memberStats = await censusApi.getOutfitMembersStats(outfitAlias)
    if (memberStats === null) throw new OutfitAliasNotFoundError()

    // Get average battle rank, kdr, SPM, playtime of all players
    let avgBr = 0
    let nKills = 0
    let nDeaths = 0
    let score = 0
    let playTime = 0

    memberStats.outfitMember = memberStats.outfitMember.filter(
      (outfitMember) => {
        return (
          typeof outfitMember.character !== 'undefined' &&
          typeof outfitMember.character.stats[8] !== 'undefined'
        )
      },
    )

    let subtitle =
      '*Stats for **' +
      memberStats.outfitMember.length.toString() +
      '** members*'

    if (args.length > 1) {
      switch (args[1]) {
        case 'active':
          memberStats.outfitMember = memberStats.outfitMember.filter(
            (outfitMember) => {
              return (
                Number(outfitMember.character.times.lastLogin) >
                Math.floor(Date.now() / 1000) - 2_592_000
              )
            },
          )
          subtitle =
            '*Stats for **' +
            memberStats.outfitMember.length.toString() +
            '** active members*'
          break

        default:
          subtitle =
            '*Stats for **' +
            memberStats.outfitMember.length.toString() +
            '** members*'
          break
      }
    }

    if (memberStats.outfitMember.length < 3) {
      return reply(
        `The outfit **${memberStats.name}** does not have enough members to display proper stats.`,
      )
    }

    memberStats.outfitMember.forEach((outfitMember) => {
      avgBr +=
        Number(outfitMember.character.prestigeLevel) * 100 +
        Number(outfitMember.character.stats[0].allTime)
      score += Number(outfitMember.character.stats[8].allTime)
      nKills += Number(outfitMember.character.stats[5].allTime)
      nDeaths += Number(outfitMember.character.stats[2].allTime)
      playTime += Number(outfitMember.character.times.minutesPlayed)
    })

    const biggestNerds = memberStats.outfitMember
      .sort((nerd1, nerd2) => {
        if (
          Number(nerd1.character.times.minutesPlayed) <
          Number(nerd2.character.times.minutesPlayed)
        ) {
          return 1
        } else return -1
      })
      .slice()

    const sweaties = memberStats.outfitMember
      .sort((sweaty1, sweaty2) => {
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
      .slice()

    const goodPlayers = memberStats.outfitMember
      .sort((goodPlayer1, goodPlayer2) => {
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
      })
      .slice()

    const avgPlayTime = divide(
      divide(playTime, Number(memberStats.outfitMember.length)),
      60,
    )
    const avgKdr = divide(nKills, nDeaths)
    const avgSpm = divide(score, playTime)
    const avgKpm = divide(nKills, playTime)
    avgBr = divide(avgBr, Number(memberStats.outfitMember.length))

    reply(
      `__**[${memberStats.alias}] ${
        memberStats.name
      }** - Average Stats__\n${subtitle}\nBattle Rank **${
        avgBr > 100
          ? '{emoji:asp| ☆}' + (avgBr - 100).toFixed(0).toString()
          : avgBr.toFixed(0)
      }** | KDR **${avgKdr.toFixed(3)}** | SPM **${avgSpm.toFixed(
        0,
      )}** | KPM **${avgKpm.toFixed(3)}** | Play time **${avgPlayTime.toFixed(
        0,
      )}** hours\n\n__**Biggest Sweaties**__\n**${
        sweaties[0].character.name.first
      }** has a KDR of **${divide(
        Number(sweaties[0].character.stats[5].allTime),
        Number(sweaties[0].character.stats[2].allTime),
      ).toFixed(3)}**\n**${
        sweaties[1]?.character.name.first
      }** has a KDR of **${divide(
        Number(sweaties[1]?.character.stats[5].allTime),
        Number(sweaties[1]?.character.stats[2].allTime),
      ).toFixed(3)}**\n**${
        sweaties[2].character.name.first
      }** has a KDR of **${divide(
        Number(sweaties[2].character.stats[5].allTime),
        Number(sweaties[2].character.stats[2].allTime),
      ).toFixed(3)}**\n\n__**Best SPM**__\n**${
        goodPlayers[0].character.name.first
      }** has a SPM of **${divide(
        Number(goodPlayers[0].character.stats[8].allTime),
        Number(goodPlayers[0].character.times.minutesPlayed),
      ).toFixed(0)}**\n**${
        goodPlayers[1].character.name.first
      }** has a SPM of **${divide(
        Number(goodPlayers[1].character.stats[8].allTime),
        Number(goodPlayers[1].character.times.minutesPlayed),
      ).toFixed(0)}**\n**${
        goodPlayers[2].character.name.first
      }** has a SPM of **${divide(
        Number(goodPlayers[2].character.stats[8].allTime),
        Number(goodPlayers[2].character.times.minutesPlayed),
      ).toFixed(0)}**\n\n__**Biggest Nerds**__\n**${
        biggestNerds[0].character.name.first
      }** played for **${divide(
        Number(biggestNerds[0].character.times.minutesPlayed),
        60,
      ).toFixed(0)}** hours\n**${
        biggestNerds[1].character.name.first
      }** played for **${divide(
        Number(biggestNerds[1].character.times.minutesPlayed),
        60,
      ).toFixed(0)}** hours\n**${
        biggestNerds[2].character.name.first
      }** played for **${divide(
        Number(biggestNerds[2].character.times.minutesPlayed),
        60,
      ).toFixed(0)}** hours\n\n`,
    )
  },
})

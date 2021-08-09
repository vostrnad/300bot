import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { validatePlayerName } from '@planetside/validators'
import { divide } from '@app/utils/math'

export default new Command({
  keyword: 'recentstats',
  description: 'show recent player stats',
  help: "Usage: `{prefix}recentstats <player name>` - shows player's recent stats",
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const characterName = args[0]
    validatePlayerName(characterName)
    const character = await censusApi.getCharactersStatsHistory(characterName)
    if (character === null) {
      return reply('There is no PlanetSide 2 character with this name.')
    }
    if (
      character.kills === null ||
      character.deaths === null ||
      character.score === null ||
      character.seconds === null
    ) {
      return reply(
        `The character ${character.name} is invalid, no stats available.`,
      )
    }

    const KD_MIN = 200
    const SECONDS_MIN = 72000 // 20 hours
    const SCORE_MIN = 120000

    const months = [
      'm01',
      'm02',
      'm03',
      'm04',
      'm05',
      'm06',
      'm07',
      'm08',
      'm09',
      'm10',
      'm11',
      'm12',
    ] as const

    const allTime = {
      kills: Number(character.kills.allTime),
      deaths: Number(character.deaths.allTime),
      score: Number(character.score.allTime),
      seconds: Number(character.seconds.allTime),
    }

    const runningTotal = {
      kills: 0,
      deaths: 0,
      score: 0,
      seconds: 0,
    }

    for (const month of months) {
      runningTotal.kills += Number(character.kills.month[month])
      runningTotal.deaths += Number(character.deaths.month[month])
      runningTotal.score += Number(character.score.month[month])
      runningTotal.seconds += Number(character.seconds.month[month])

      if (
        2 * runningTotal.kills > allTime.kills ||
        2 * runningTotal.deaths > allTime.deaths ||
        2 * runningTotal.score > allTime.score ||
        2 * runningTotal.seconds > allTime.seconds
      ) {
        return reply(
          `The character ${character.name} has not played enough recently to have any recent stats`,
        )
      }

      if (
        runningTotal.kills + runningTotal.deaths >= KD_MIN &&
        runningTotal.score >= SCORE_MIN &&
        runningTotal.seconds >= SECONDS_MIN
      ) {
        const getComparisonString = (before: number, after: number) => {
          const same = `**${after}** (same as all time)`
          if (before < after) {
            const r = Math.round(100 * (divide(after, before) - 1))
            if (r !== 0) return `**${after}** (${r}% up from **${before}**)`
          } else if (before > after) {
            const r = Math.round(100 * (divide(before, after) - 1))
            if (r !== 0) return `**${after}** (${r}% down from **${before}**)`
          }
          return same
        }

        const beforeKdr = divide(allTime.kills, allTime.deaths, 3)
        const afterKdr = divide(runningTotal.kills, runningTotal.deaths, 3)
        const beforeSpm = divide(allTime.score, allTime.seconds / 60, 0)
        const afterSpm = divide(
          runningTotal.score,
          runningTotal.seconds / 60,
          0,
        )
        const beforeKpm = divide(allTime.kills, allTime.seconds / 60, 3)
        const afterKpm = divide(
          runningTotal.kills,
          runningTotal.seconds / 60,
          3,
        )

        let message = `__Recent stats for **${character.name}**:__\n\n`
        message += `KDR: ${getComparisonString(beforeKdr, afterKdr)}\n`
        message += `SPM: ${getComparisonString(beforeSpm, afterSpm)}\n`
        message += `KPM: ${getComparisonString(beforeKpm, afterKpm)}\n`

        return reply(message)
      }
    }
  },
})

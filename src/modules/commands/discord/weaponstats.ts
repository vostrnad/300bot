import { camelCase } from 'camel-case'
import * as discord from 'discord.js'
import { PlayerNotFoundError } from '@app/errors'
import { divide } from '@app/utils/math'
import { Command } from '@commands/command-handler'
import { DiscordParams } from '@commands/params'
import { validateArgumentRange } from '@commands/validators'
import { sendScrollEmbed } from '@discord/embed'
import { censusApi } from '@planetside/census-api'
import {
  CharacterWeaponStats,
  CharacterWeaponStatsByFaction,
  Item,
} from '@planetside/types'
import { validatePlayerName } from '@planetside/validators'

export default new Command<DiscordParams>({
  keyword: 'weaponstats',
  description: 'show PS2 player weapon stats',
  help: 'Usage:\n`{prefix}weaponstats <player name>` - shows player weapons by kills\n`{prefix}weaponstats <player name> full` - shows full player weapons stats',
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentRange(args.length, 1, 2)
    validatePlayerName(args[0])

    type StatNames =
      | 'weaponDeaths'
      | 'weaponFireCount'
      | 'weaponHitCount'
      | 'weaponPlayTime'
      | 'weaponScore'

    type StatNamesByFaction =
      | 'weaponDamageGiven'
      | 'weaponHeadshots'
      | 'weaponKilledBy'
      | 'weaponKills'
      | 'weaponVehicleKills'

    type RefomarttedStats = {
      characterId: string
      itemId: string
      item: Item
      weaponStats: Partial<Record<StatNames, CharacterWeaponStats>>
      weaponStatsByFaction: Partial<
        Record<StatNamesByFaction, CharacterWeaponStatsByFaction>
      >
    }

    const character = await censusApi.getCharacter({
      name: { firstLower: args[0].toLowerCase() },
    })

    if (character === null) throw new PlayerNotFoundError()

    // VS NC TR
    const factionColorsActive = [
      '#FFFFFF',
      '#951CFF',
      '#0165FF',
      '#FF311F',
    ] as const
    const factionColorsEnd = [
      '#000000',
      '#4B0E80',
      '#003380',
      '#80180F',
    ] as const

    const weaponStatsList = await censusApi.getPlayerWeaponStats(
      character.characterId,
    )

    if (weaponStatsList === null) return reply('No stats to show.')

    const weaponStatsReformatted: RefomarttedStats[] = []

    weaponStatsList.forEach((weapon) => {
      const { weaponStatsByFaction, weaponStats, ...rest } = weapon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const line: RefomarttedStats = Object.assign(rest)

      const res: Partial<
        Record<StatNamesByFaction, CharacterWeaponStatsByFaction>
      > = {}
      weaponStatsByFaction.forEach((stat) => {
        const statNameCamelCase = camelCase(stat.statName) as StatNamesByFaction
        res[statNameCamelCase] = stat
      })
      line.weaponStatsByFaction = res

      const res1: Partial<Record<StatNames, CharacterWeaponStats>> = {}
      weaponStats.forEach((stat) => {
        const statNameCamelCase = camelCase(stat.statName) as StatNames
        res1[statNameCamelCase] = stat
      })
      line.weaponStats = res1

      weaponStatsReformatted.push(line)
    })

    // TODO Add sorting options
    weaponStatsReformatted.sort((w1, w2) => {
      if (w1.weaponStatsByFaction.weaponKills === undefined) return 1
      if (w2.weaponStatsByFaction.weaponKills === undefined) return -1
      if (
        Number(w1.weaponStatsByFaction.weaponKills.valueNc) +
          Number(w1.weaponStatsByFaction.weaponKills.valueVs) +
          Number(w1.weaponStatsByFaction.weaponKills.valueTr) <
        Number(w2.weaponStatsByFaction.weaponKills.valueNc) +
          Number(w2.weaponStatsByFaction.weaponKills.valueVs) +
          Number(w2.weaponStatsByFaction.weaponKills.valueTr)
      ) {
        return 1
      } else return -1
    })
    const sortingStatDisplay = 'kills'

    return sendScrollEmbed(
      env.message,
      weaponStatsReformatted,
      (weapon, index, active) => {
        const weaponEmbed = new discord.MessageEmbed()
          .setTitle(
            `Weapons for ${character.name.first} by ${sortingStatDisplay} (${
              index + 1
            }/${weaponStatsReformatted.length})`,
          )
          .setDescription(`**${weapon.item.name.en}**`)
          .setThumbnail(
            `http://census.daybreakgames.com${weapon.item.imagePath}`,
          )
          .addFields(
            {
              name: 'Kills',
              value: (
                Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                  Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                  Number(weapon.weaponStatsByFaction.weaponKills?.valueVs) ||
                'N/A'
              ).toString(),
              inline: true,
            },
            {
              name: 'Deaths',
              value: weapon.weaponStats.weaponDeaths?.value || 'N/A',
              inline: true,
            },
            {
              name: 'Playtime',
              value: `${
                divide(
                  Number(weapon.weaponStats.weaponPlayTime?.value),
                  3600,
                  0,
                ) || 'N/A'
              } hours`,
              inline: true,
            },
          )
          .setTimestamp()

        if (args.length > 1 && args[1] === 'full') {
          weaponEmbed
            .addFields(
              {
                name: 'KDR',
                value: (
                  divide(
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                      Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                      Number(weapon.weaponStatsByFaction.weaponKills?.valueVs),
                    Number(weapon.weaponStats.weaponDeaths?.value),
                    3,
                  ) || 'N/A'
                ).toString(),
                inline: true,
              },
              {
                name: 'KPM',
                value: (
                  divide(
                    (Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                      Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                      Number(
                        weapon.weaponStatsByFaction.weaponKills?.valueVs,
                      )) *
                      60,
                    Number(weapon.weaponStats.weaponPlayTime?.value),
                    3,
                  ) || 'N/A'
                ).toString(),
                inline: true,
              },
              {
                name: 'SPM',
                value: (
                  divide(
                    Number(weapon.weaponStats.weaponScore?.value) * 60,
                    Number(weapon.weaponStats.weaponPlayTime?.value),
                    0,
                  ) || 'N/A'
                ).toString(),
                inline: true,
              },
            )
            .addFields(
              {
                name: 'Accuracy',
                value: `${
                  divide(
                    Number(weapon.weaponStats.weaponHitCount?.value) * 100,
                    Number(weapon.weaponStats.weaponFireCount?.value),
                    3,
                  ) || 'N/A'
                } %`,
                inline: true,
              },
              {
                name: 'HSR',
                value: `${
                  divide(
                    (Number(
                      weapon.weaponStatsByFaction.weaponHeadshots?.valueNc,
                    ) +
                      Number(
                        weapon.weaponStatsByFaction.weaponHeadshots?.valueTr,
                      ) +
                      Number(
                        weapon.weaponStatsByFaction.weaponHeadshots?.valueVs,
                      )) *
                      100,
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                      Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                      Number(weapon.weaponStatsByFaction.weaponKills?.valueVs),
                    3,
                  ) || 'N/A'
                } %`,
                inline: true,
              },
              {
                name: 'HPK',
                value: (
                  divide(
                    Number(weapon.weaponStats.weaponHitCount?.value),
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                      Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                      Number(weapon.weaponStatsByFaction.weaponKills?.valueVs),
                    0,
                  ) || 'N/A'
                ).toString(),
                inline: true,
              },
            )
        }

        if (active) {
          weaponEmbed
            .setFooter({ text: 'Interactive' })
            .setColor(factionColorsActive[Number(character.factionId)])
        } else {
          weaponEmbed
            .setFooter({ text: 'Interaction ended' })
            .setColor(factionColorsEnd[Number(character.factionId)])
        }

        return weaponEmbed
      },
    )
  },
})

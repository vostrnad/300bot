import { camelCase } from 'camel-case'
import discord from 'discord.js'
import { PlayerNotFoundError } from '@app/errors'
import { constants } from '@app/global/constants'
import { removeReaction } from '@app/modules/discord/utils'
import {
  Character,
  CharacterWeaponStats,
  Item,
  CharacterWeaponStatsByFaction,
} from '@app/modules/planetside/types'
import { divide, mod } from '@app/utils/math'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { validateArgumentRange } from '../validators'

export default new Command<discord.Message>({
  keyword: 'weaponstats',
  description: 'show PS2 player weapon stats',
  help: 'Usage:\n`{prefix}weaponstats <player name>` - shows player weapons by kills\n`{prefix}weaponstats <player name> full` - shows full player weapons stats',
  callback: async ({ args, reply, raw, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentRange(args.length, 1, 2)

    const genWeaponEmbed = (
      character: Character,
      sortingStatDisplay: string,
      weapon: RefomarttedStats,
      color: string,
      page: number,
      len: number,
    ): discord.MessageEmbed => {
      const weaponEmbed = new discord.MessageEmbed()
        .setColor(color)
        .setTitle(
          `Weapons for ${character.name.first} by ${sortingStatDisplay} (${
            page + 1
          }/${len})`,
        )
        .setDescription('**' + weapon.item.name.en + '**')
        .setThumbnail(`http://census.daybreakgames.com${weapon.item.imagePath}`)
        .addFields(
          {
            name: 'Kills',
            value:
              Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                Number(weapon.weaponStatsByFaction.weaponKills?.valueVs) ||
              'N/A',
            inline: true,
          },
          {
            name: 'Deaths',
            value: weapon.weaponStats.weaponDeaths?.value || 'N/A',
            inline: true,
          },
          {
            name: 'Playtime',
            value:
              (
                divide(
                  Number(weapon.weaponStats.weaponPlayTime?.value),
                  3600,
                  0,
                ) || 'N/A'
              ).toString() + ' hours',
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter('Interactive')

      if (args.length > 1 && args[1] === 'full') {
        weaponEmbed
          .addFields(
            {
              name: 'KDR',
              value:
                divide(
                  Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueVs),
                  Number(weapon.weaponStats.weaponDeaths?.value),
                  3,
                ) || 'N/A',
              inline: true,
            },
            {
              name: 'KPM',
              value:
                divide(
                  (Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueVs)) *
                    60,
                  Number(weapon.weaponStats.weaponPlayTime?.value),
                  3,
                ) || 'N/A',
              inline: true,
            },
            {
              name: 'SPM',
              value:
                divide(
                  Number(weapon.weaponStats.weaponScore?.value) * 60,
                  Number(weapon.weaponStats.weaponPlayTime?.value),
                  0,
                ) || 'N/A',
              inline: true,
            },
          )
          .addFields(
            {
              name: 'Accuracy',
              value:
                (
                  divide(
                    Number(weapon.weaponStats.weaponHitCount?.value) * 100,
                    Number(weapon.weaponStats.weaponFireCount?.value),
                    3,
                  ) || 'N/A'
                ).toString() + ' %',
              inline: true,
            },
            {
              name: 'HSR',
              value:
                (
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
                ).toString() + ' %',
              inline: true,
            },
            {
              name: 'HPK',
              value:
                divide(
                  Number(weapon.weaponStats.weaponHitCount?.value),
                  Number(weapon.weaponStatsByFaction.weaponKills?.valueNc) +
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueTr) +
                    Number(weapon.weaponStatsByFaction.weaponKills?.valueVs),
                  0,
                ) || 'N/A',
              inline: true,
            },
          )
      }

      return weaponEmbed
    }

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

    const timeout = 10 * 60 * 1000 // 10 minutes

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

    const factionColorsActive = ['#FFFFFF', '#951CFF', '#0165FF', '#FF311F'] // VS NC TR
    const factionColorsEnd = ['#000000', '#4B0E80', '#003380', '#80180F'] // VS NC TR

    const color = factionColorsActive[Number(character.factionId)]

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

    let page = 0

    const listLen = weaponStatsReformatted.length

    let weaponEmbed = genWeaponEmbed(
      character,
      sortingStatDisplay,
      weaponStatsReformatted[0],
      color,
      page,
      listLen,
    )

    const embedMessage = await raw.channel.send({ embed: weaponEmbed })

    const leftArrowReaction = await embedMessage.react(
      constants.discord.emojis.arrowLeft,
    )
    const rightArrowReaction = await embedMessage.react(
      constants.discord.emojis.arrowRight,
    )

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
        page = mod(page + 1, listLen)
      }

      if (reaction.emoji.name === constants.discord.emojis.arrowLeft) {
        page = mod(page - 1, listLen)
      }

      void (async () => {
        await removeReaction(reaction, raw.author)

        weaponEmbed = genWeaponEmbed(
          character,
          sortingStatDisplay,
          weaponStatsReformatted[page],
          color,
          page,
          listLen,
        )

        weaponEmbed.setTimestamp()
        await embedMessage.edit({ embed: weaponEmbed })
      })()
    })

    collector.on('end', () => {
      weaponEmbed
        .setFooter('Interaction ended')
        .setColor(factionColorsEnd[Number(character.factionId)])
        .setTimestamp()
      void (async () => {
        await removeReaction(leftArrowReaction, embedMessage.author)
        await removeReaction(rightArrowReaction, embedMessage.author)
        await embedMessage.edit({ embed: weaponEmbed })
      })()
    })
  },
})

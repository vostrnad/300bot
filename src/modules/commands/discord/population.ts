import { Command } from '@commands/CommandHandler'
import discord from 'discord.js'
import { isRecord } from '@app/validators/object'
import camelcaseKeys from 'camelcase-keys'
import { constants } from '@app/global/constants'
import got from 'got'
import { getEmoji } from '@discord/utils'
import { divide } from '@app/utils/math'

type Response = {
  worldId: number
  timestamp: number
  vs: number
  nc: number
  tr: number
  ns: number
  unknown: number
}

export default new Command<discord.Message>({
  keyword: 'population',
  description: 'display the current population',
  help: 'Usage: `{prefix}population` - displays the current population',
  alias: ['pop'],
  options: {
    lastArgNumber: 1,
  },
  callback: async ({ args, reply, raw }) => {
    async function getPop(serverId: number) {
      const url = `https://ps2.fisu.pw/api/population/?world=${serverId}`

      const list = (await got(url)
        .json()
        .then((data) => {
          if (!isRecord(data)) {
            return Promise.reject(new Error(`Unexpected query return type`))
          }

          const result = data.result
          if (!result) {
            return Promise.reject(new Error(`List not in result`))
          }
          if (!Array.isArray(result)) {
            return Promise.reject(new Error(`List is not an array`))
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return camelcaseKeys(result, { deep: true })
        })) as Response[]

      return list[0]
    }

    if (args.length > 0) return

    const population = await getPop(constants.planetside.worldIds.miller)

    const totalPop =
      population.tr + population.nc + population.vs + population.ns

    let message = `**Overall Miller population:** ${totalPop}\n`
    message += `${Math.round(divide(population.tr, totalPop) * 100)}%${
      getEmoji(raw.channel, 'faction_logo_tr')?.toString() || ' TR'
    }\t${Math.round(divide(population.nc, totalPop) * 100)}%${
      getEmoji(raw.channel, 'faction_logo_nc')?.toString() || ' NC'
    }\t${Math.round(divide(population.vs, totalPop) * 100)}%${
      getEmoji(raw.channel, 'faction_logo_vs')?.toString() || ' VS'
    }\t${Math.round(divide(population.ns, totalPop) * 100)}%${
      getEmoji(raw.channel, 'faction_logo_ns')?.toString() || ' NS'
    }`

    reply(message)
  },
})

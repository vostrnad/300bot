import camelcaseKeys from 'camelcase-keys'
import got from 'got'
import { constants } from '@app/global/constants'
import { divide } from '@app/utils/math'
import { isDefined } from '@app/validators'
import { isRecord } from '@app/validators/object'
import { Command } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'
import { getServerByName } from '@planetside/resources'

type Result = {
  worldId: number
  timestamp: number
  vs: number
  nc: number
  tr: number
  ns: number
  unknown: number
}

export default new Command({
  keyword: 'population',
  description: 'display the current population',
  help: 'Usage:\n`{prefix}population` - displays the current population\n`{prefix}population <server>` - diplays the current population in a specific server\n`{prefix}population numbers` - diplays the current population with numbers',
  alias: ['pop'],
  callback: async ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 2)

    let worldId = constants.planetside.worldIds.miller
    let worldName = 'Miller'
    let numbersBool = false

    if (args.length > 0) {
      let argsProcessed = 0

      if (args.includes('numbers')) {
        numbersBool = true
        argsProcessed++
      }

      const serverArgs = args
        .map((arg) => getServerByName(arg))
        .filter(isDefined)

      if (serverArgs.length > 0) {
        if (serverArgs.length > 1) {
          return reply('Error: Cannot search multiple servers at once.')
        }

        ;[worldId, worldName] = serverArgs[0]
        argsProcessed++
      }

      if (argsProcessed !== args.length) {
        return reply(env.command.getHelp(env.handler))
      }
    }

    const url = `https://ps2.fisu.pw/api/population/?world=${worldId}`

    const population = (await got(url)
      .json()
      .then((data) => {
        if (!isRecord(data)) {
          throw new Error(`Unexpected query return type`)
        }

        const result = data.result
        if (!result) {
          throw new Error(`List not in result`)
        }
        if (!Array.isArray(result)) {
          throw new Error(`List is not an array`)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return camelcaseKeys(result[0], { deep: true })
      })) as Result

    const totalPop =
      population.tr + population.nc + population.vs + population.ns

    let message = `**${worldName} population:** ${totalPop}\n`
    message += [
      `{emoji:faction_logo_tr| TR} ${
        numbersBool
          ? population.tr
          : Math.round(divide(population.tr, totalPop) * 100).toString() + '%'
      }`,
      `{emoji:faction_logo_nc| NC} ${
        numbersBool
          ? population.nc
          : Math.round(divide(population.nc, totalPop) * 100).toString() + '%'
      }`,
      `{emoji:faction_logo_vs| VS} ${
        numbersBool
          ? population.vs
          : Math.round(divide(population.vs, totalPop) * 100).toString() + '%'
      }`,
      `{emoji:faction_logo_ns| NS} ${
        numbersBool
          ? population.ns
          : Math.round(divide(population.ns, totalPop) * 100).toString() + '%'
      }`,
    ].join('    ')

    reply(message)
  },
})

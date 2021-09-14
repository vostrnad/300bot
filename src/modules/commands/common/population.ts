import camelcaseKeys from 'camelcase-keys'
import got from 'got'
import { constants } from '@app/global/constants'
import { divide } from '@app/utils/math'
import { isRecord } from '@app/validators/object'
import { Command } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'

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
  help: 'Usage:\n`{prefix}population` - displays the current population\n`{prefix}population numbers` - diplays the current population with numbers',
  alias: ['pop'],
  callback: async ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 1)

    if (args.length === 1 && args[0] !== 'numbers') {
      return reply(env.command.getHelp(env.handler))
    }

    const numbersBool = args.length === 1 && args[0] === 'numbers'

    const url = `https://ps2.fisu.pw/api/population/?world=${constants.planetside.worldIds.miller}`

    const population = (await got(url)
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
        return camelcaseKeys(result[0], { deep: true })
      })) as Result

    const totalPop =
      population.tr + population.nc + population.vs + population.ns

    let message = `**Miller population:** ${totalPop}\n`
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

import { evaluate } from 'mathjs'
import { Command } from '@commands/CommandHandler'
import { roundIfClose } from '@app/utils/math'

type MathJsResult = number | { re: number; im: number }

export default new Command({
  keyword: 'math',
  description: 'evaluate a math expression',
  help: 'Usage: `{prefix}math [expression]` - evaluates a math expression',
  options: {
    lastArgNumber: 1,
  },
  callback: ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }

    const expression = args[0]

    try {
      const res = evaluate(expression) as MathJsResult

      if (typeof res === 'object') {
        if (typeof res.re === 'number' && typeof res.im === 'number') {
          res.re = roundIfClose(res.re, 1e-12)
          res.im = roundIfClose(res.im, 1e-12)
        }
        return reply(`= ${res.toString()}`)
      } else {
        if (Number.isFinite(res)) {
          return reply(`= ${roundIfClose(res, 1e-12)}`)
        } else {
          return reply('Error: the result is too big.')
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        return reply(`Error: ${e.message}.`)
      } else {
        console.error(e)
        return reply('There was an error calculating the expression.')
      }
    }
  },
})

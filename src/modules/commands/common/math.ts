import { Promise as WorkerPoolPromise } from 'workerpool'
import { Command } from '@commands/CommandHandler'
import { math } from '@app/workers'

export default new Command({
  keyword: 'math',
  description: 'evaluate a math expression',
  help: 'Usage: `{prefix}math [expression]` - evaluates a math expression',
  options: {
    lastArgNumber: 1,
  },
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }

    const expression = args[0]

    try {
      const res = (await math
        .exec('evaluate', [expression])
        .timeout(1000)) as string
      return reply(`= ${res}`)
    } catch (e: unknown) {
      if (e instanceof WorkerPoolPromise.TimeoutError) {
        return reply(`Error: The expression took too long to evaluate.`)
      } else if (e instanceof Error) {
        return reply(`Error: ${e.message}.`)
      } else {
        // eslint-disable-next-line no-console
        console.error(e)
        return reply('There was an error calculating the expression.')
      }
    }
  },
})

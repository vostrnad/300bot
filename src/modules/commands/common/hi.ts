import { Command } from '@commands/CommandHandler'
import { randomBigInt } from '@app/utils/random'
import { isDigit } from '@app/validators/string'

export default new Command({
  keyword: 'hi',
  description: 'Says hi!',
  help: 'Usage: `{prefix}hi` - says hi!',
  callback: ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply('Hi!')
    }
  },
})
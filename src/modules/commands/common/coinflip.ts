import { Command } from '@commands/CommandHandler'
import { randomChoice } from '@app/utils/random'

export default new Command({
  keyword: 'coinflip',
  description: 'flip a coin',
  help: 'Usage: `{prefix}coinflip` - flips a coin',
  callback: ({ args, reply }) => {
    if (args.length > 0) return

    reply(randomChoice(['Heads!', 'Tails!']))
  },
})

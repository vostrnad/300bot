import { randomBigInt } from '@app/utils/random'
import { isDigit } from '@app/validators/string'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'

export default new Command({
  keyword: 'diceroll',
  description: 'roll a dice',
  help: 'Usage: `{prefix}diceroll <number of sides>` - rolls a dice',
  callback: ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const sides = args[0]
    if (!isDigit(sides)) {
      return reply('Error: Invalid argument.')
    }
    if (sides === '0') {
      return reply('Error: Number of sides is too low.')
    }
    // TODO: add more granular error messages
    const rolled = randomBigInt(BigInt(sides)) + BigInt(1)
    reply(`The dice rolled number ${rolled.toString()}!`)
  },
})

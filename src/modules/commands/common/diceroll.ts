import { Command } from '@commands/CommandHandler'
import { randomBigInt } from '@app/utils/random'
import { isDigit } from '@app/validators/string'

export default new Command({
  keyword: 'diceroll',
  description: 'roll a dice',
  help: 'Usage: `{prefix}diceroll <number of sides>` - rolls a dice',
  callback: ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    if (args.length > 1) {
      return reply('Error: this command takes only one argument.')
    }
    const sides = args[0]
    if (!isDigit(sides)) {
      return reply('Error: invalid argument.')
    }
    if (sides === '0') {
      return reply('Error: number of sides is too low.')
    }
    // TODO: add more granular error messages
    const rolled = randomBigInt(BigInt(sides)) + BigInt(1)
    reply(`The dice rolled number ${rolled.toString()}!`)
  },
})

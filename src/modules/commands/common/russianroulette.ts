import { Command } from '@commands/CommandHandler'
import { randomBigInt } from '@app/utils/random'
import { randomChoice } from '@app/utils/random'

export default new Command({
  keyword: 'russianroulette',
  description: 'kill yourself for fun purposes',
  help: 'Usage: `{prefix}russianroulette` - kill yourself for fun purposes',
  callback: ({ args, reply, author }) => {
    if (args.length > 0) return
    const rounds = 6
    const rolled = randomBigInt(BigInt(rounds)) + BigInt(1)
    if (rolled === 0) {
      reply(
        `**${author.displayName}** ` +
          randomChoice([
            'died.',
            'failed at this game.',
            'brutally died.',
            'now hqs a sixth hole in his head.',
          ]),
      )
    } else {
      reply(
        `**${author.displayName}** ` +
          randomChoice([
            'gets to live another day.',
            'was lucky this time.',
            'survived this round.',
            'should stop playing this dangerous game before it is too late',
          ]),
      )
    }
  },
})

import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { randomBigInt, randomChoice } from '@app/utils/random'
import { sleep } from '@app/utils/async'

export default new Command<discord.Message>({
  keyword: 'russianroulette',
  description: 'kill yourself for fun purposes',
  help: 'Usage: `{prefix}russianroulette` - kill yourself for fun purposes',
  callback: async ({ args, author, reply, raw }) => {
    if (args.length > 0) return
    const rounds = 6
    const rolled = randomBigInt(BigInt(rounds)) + BigInt(1)
    const deadRole = raw.guild?.roles.cache.find((role) => role.name === 'Dead')

    if (!(deadRole instanceof discord.Role)) {
      return reply('The Dead role is not defined.')
    }

    if (rolled === BigInt(1)) {
      await raw.member?.roles.add(deadRole)

      reply(
        `**${author.displayName}** ` +
          randomChoice([
            'died.',
            'failed at this game.',
            'brutally died.',
            'now has a sixth hole in their head.',
          ]),
      )
      await sleep(10 * 1000)
      await raw.member?.roles.remove(deadRole)
    } else {
      reply(
        `**${author.displayName}** ` +
          randomChoice([
            'gets to live another day.',
            'was lucky this time.',
            'survived this round.',
            'should stop playing this dangerous game before it is too late.',
          ]),
      )
    }
  },
})

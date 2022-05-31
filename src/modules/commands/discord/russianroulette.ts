import assert from 'assert'
import discord from 'discord.js'
import { randomChoice, randomInteger } from '@app/utils/random'
import { Command } from '@commands/CommandHandler'
import { DiscordParams } from '@commands/params'
import { killMember } from '@discord/revive'

export default new Command<DiscordParams>({
  keyword: 'russianroulette',
  description: 'kill yourself for fun purposes',
  help: 'Usage: `{prefix}russianroulette` - kill yourself for fun purposes',
  callback: async ({ args, author, reply, env }) => {
    if (args.length > 0) return
    const rounds = 6
    const rolled = randomInteger(rounds)
    const deadRole = env.message.guild?.roles.cache.find(
      (role) => role.name === 'Dead',
    )

    if (!(deadRole instanceof discord.Role)) {
      return reply('The Dead role is not defined.')
    }

    // should never fail
    assert(env.message.member)

    if (rolled === 0) {
      await killMember(env.message.member, deadRole, 3600 * 1000)
      reply(
        `**${author.displayName}** ` +
          randomChoice([
            'died.',
            'failed at this game.',
            'brutally died.',
            'now has a sixth hole in their head.',
          ]),
      )
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

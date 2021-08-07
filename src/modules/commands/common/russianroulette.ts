<<<<<<< HEAD
import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { randomBigInt, randomChoice } from '@app/utils/random'
import { sleep } from '@app/utils/async'
=======
import { Command } from '@commands/CommandHandler'
import { randomBigInt, randomChoice } from '@app/utils/random'
>>>>>>> 32ea10d136ec20c60804cd080ad3cba10fcdea21

export default new Command({
  keyword: 'russianroulette',
  description: 'kill yourself for fun purposes',
  help: 'Usage: `{prefix}russianroulette` - kill yourself for fun purposes',
<<<<<<< HEAD
  callback: ({ args, reply, author, raw }) => {
    if (args.length > 0) return

    const rounds = 6
    const rolled = randomBigInt(BigInt(rounds)) + BigInt(1)
    const Deadrole = member.guild.roles.cache.find(
      (role) => role.name === 'Dead',
    )

    if (rolled === BigInt(1)) {
      raw.author.roles.add(Deadrole)
=======
  callback: ({ args, reply, author }) => {
    if (args.length > 0) return
    const rounds = 6
    const rolled = randomBigInt(BigInt(rounds)) + BigInt(1)
    if (rolled === BigInt(1)) {
>>>>>>> 32ea10d136ec20c60804cd080ad3cba10fcdea21
      reply(
        `**${author.displayName}** ` +
          randomChoice([
            'died.',
            'failed at this game.',
            'brutally died.',
            'now has a sixth hole in their head.',
          ]),
      )
<<<<<<< HEAD
      sleep(10 * 1000)
      raw.author.roles.remove(Deadrole)
=======
>>>>>>> 32ea10d136ec20c60804cd080ad3cba10fcdea21
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

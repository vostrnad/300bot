import { Command } from '@commands/command-handler'
import { DiscordParams } from '@commands/params'
import { validateArgumentNumber } from '@commands/validators'
import { managerDatabase } from '@database/managers'

export default new Command<DiscordParams>({
  keyword: 'managers',
  description: 'add or remove bot managers',
  help: 'Usage: `{prefix}managers <add|remove>` - adds or removes a bot manager',
  options: {
    hidden: true,
  },
  callback: async ({ args, author, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 2)

    if (!author.permissions.botAdmin) {
      return reply('This command can only be used by a bot admin.')
    }

    const action = args[0]
    if (action !== 'add' && action !== 'remove') {
      return reply(
        'Error: The first argument must be either "add" or "remove".',
      )
    }

    const mentions = env.message.mentions
    const mentioned = mentions.members?.first() || mentions.users.first()
    if (!mentioned) {
      return reply('Error: The argument must be a mention.')
    }

    const userId = mentioned.id
    const userDisplayName = mentioned.displayName

    if (action === 'add') {
      if (managerDatabase.has(userId)) {
        reply(`**${userDisplayName}** is already a bot manager.`)
      } else {
        await managerDatabase.set(userId, 1)
        reply(
          `**${userDisplayName}** has been added to the list of bot managers.`,
        )
      }
    } else {
      if (managerDatabase.has(userId)) {
        await managerDatabase.delete(userId)
        reply(
          `**${userDisplayName}** has been removed from the list of bot managers.`,
        )
      } else {
        reply(`**${userDisplayName}** is currently not a bot manager.`)
      }
    }
  },
})

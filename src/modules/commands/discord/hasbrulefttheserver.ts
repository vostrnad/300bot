import { constants } from '@app/global/constants'
import { Command } from '@commands/CommandHandler'
import { DiscordParams } from '@commands/params'

export default new Command<DiscordParams>({
  keyword: 'hasbrulefttheserver',
  description: 'check if Bru is online',
  help: 'Usage: `{prefix}hasbrulefttheserver` - checks if Bru has left the server',
  options: {
    hidden: true,
  },
  callback: ({ args, reply, env }) => {
    if (args.length > 0) return

    const guild = env.message.guild
    if (guild === null) {
      return reply('This command can only be used in a server.')
    }

    if (
      typeof guild.members.cache.find(
        (user) => user.id === constants.discord.userIds.bru,
      ) === 'undefined'
    ) {
      return reply('Yes, Bru has left the server.')
    } else {
      return reply('No, Bru is currently in the server.')
    }
  },
})

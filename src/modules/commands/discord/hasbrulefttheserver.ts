import discord from 'discord.js'
import { constants } from '@app/global/constants'
import { Command } from '@commands/CommandHandler'

export default new Command<discord.Message>({
  keyword: 'hasbrulefttheserver',
  alias: ['hasbrulefttheserver'],
  description: 'check if Bru is online',
  help: 'Usage: `{prefix}isbruonline` - checks if Bru is online',
  callback: ({ args, reply, raw }) => {
    if (args.length > 0) return
    if (raw.guild === null) {
      return reply('This command can only be used inside of a server')
    }

    if (
      typeof raw.guild.members.cache.find(
        (user) => user.id === constants.discord.userIds.bru,
      ) === 'undefined'
    ) {
      return reply('**Bru** has left the server')
    } else {
      return reply('**Bru** is currently on the server')
    }
  },
})

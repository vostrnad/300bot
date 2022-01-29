import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { guildDatabase } from '@database/guilds'

export default new Command<discord.Message>({
  keyword: 'prefix',
  description: 'set command prefix',
  help: 'Usage: `{prefix}prefix <prefix>` - updates command prefix',
  callback: async ({ args, author, reply, env, raw }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const channel = raw.channel
    if (!(channel instanceof discord.TextChannel)) {
      return reply('Cannot set prefix in this type of channel.')
    }
    if (!author.admin) {
      return reply('You are not an admin or a bot operator in this server.')
    }

    await guildDatabase.set(channel.guild.id, { prefix: args[0] })

    reply('Command prefix updated.')
  },
})

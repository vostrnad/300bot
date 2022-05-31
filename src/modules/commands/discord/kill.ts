import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { DiscordParams } from '@commands/params'
import { validateArgumentNumber } from '@commands/validators'
import { killMember } from '@discord/revive'

export default new Command<DiscordParams>({
  keyword: 'kill',
  description: 'kill user',
  help: 'Usage: `{prefix}kill <user mention>` - kills user',
  options: {
    hidden: true,
  },
  callback: async ({ args, author, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }

    const message = env.message
    const channel = message.channel

    if (!(channel instanceof discord.TextChannel)) {
      return reply('Error: This type of channel is not supported.')
    }
    if (!author.admin) {
      return reply('You are not an admin in this server.')
    }
    const deadRole = channel.guild.roles.cache.find(
      (role) => role.name === 'Dead',
    )
    if (!deadRole) {
      return reply('Error: The Dead role is not defined.')
    }
    validateArgumentNumber(args.length, 1)

    const mentioned = message.mentions.members?.first()
    if (!mentioned) {
      return reply('Error: The argument must be a mention.')
    }

    await killMember(mentioned, deadRole, 3600 * 1000)
    return reply(`**${mentioned.displayName}** has been killed.`)
  },
})

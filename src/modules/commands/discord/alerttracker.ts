import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { alertTrackerDatabase } from '@database/alerttracker'

export default new Command<discord.Message>({
  keyword: 'alerttracker',
  description: 'configure the alert tracker',
  help: 'Usage: `{prefix}alerttracker <on/off>` - turns the alert tracker on or off',
  category: 'Admin',
  callback: async ({ args, reply, env, raw }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const option = args[0]
    if (option !== 'on' && option !== 'off') {
      return reply('Error: The argument must be either "on" or "off".')
    }
    const channel = raw.channel
    if (!(channel instanceof discord.TextChannel)) {
      return reply('Error: This type of channel is not supported.')
    }

    const dbPath = `${channel.guild.id}` as const
    const currentChannelId = alertTrackerDatabase.get(dbPath)

    if (option === 'on') {
      if (channel.id === currentChannelId) {
        return reply('Alert tracker is already on in this channel.')
      } else {
        await alertTrackerDatabase.set(dbPath, channel.id)
        return reply('Alert tracker is now on in this channel.')
      }
    } else {
      if (currentChannelId === undefined) {
        return reply('Alert tracker is already turned off.')
      } else {
        await alertTrackerDatabase.delete(dbPath)
        return reply('Alert tracker is now turned off.')
      }
    }
  },
})

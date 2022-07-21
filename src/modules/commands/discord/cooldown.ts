import discord from 'discord.js'
import { sleep } from '@app/utils/async'
import { Command } from '@commands/CommandHandler'
import { DiscordParams } from '@commands/params'

export default new Command<DiscordParams>({
  keyword: 'cooldown',
  description: 'close a channel temporarily',
  help: 'Usage: `{prefix}cooldown` - temporarily disables sending messages in the channel',
  callback: async ({ author, reply, env }) => {
    if (!author.permissions.localAdmin) {
      return reply('You are not an admin in this server.')
    }

    const channel = env.message.channel
    if (!(channel instanceof discord.TextChannel)) {
      return reply('This type of channel is not supported.')
    }
    await channel.updateOverwrite(channel.guild.roles.everyone, {
      SEND_MESSAGES: false,
    })
    reply('This channel is now on cooldown.')

    await sleep(300 * 1000)

    await channel.updateOverwrite(channel.guild.roles.everyone, {
      SEND_MESSAGES: null,
    })
  },
})

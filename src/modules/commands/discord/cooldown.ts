import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { sleep } from '@app/utils/async'

export default new Command<discord.Message>({
  keyword: 'cooldown',
  description: 'close a channel temporarily',
  help: 'Usage: `{prefix}cooldown` - temporarily disables sending messages in the channel',
  callback: async ({ author, reply, raw }) => {
    if (!author.admin) {
      return reply('You are not an admin or a bot operator in this server.')
    }

    const channel = raw.channel
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

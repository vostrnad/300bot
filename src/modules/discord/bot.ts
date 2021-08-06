import discord from 'discord.js'
import { commands } from '@commands/index'
import { CommandHandler, CommandMessage } from '@commands/CommandHandler'
import { streamingApi } from '@planetside/StreamingApi'
import { getTextChannel } from '@discord/utils'
import { constants } from '@app/global/constants'
import { getUTCShort } from '@app/utils/time'
import { env } from '@app/env'

const client = new discord.Client()

/**
 * Sends a message with UTC timestamp and optionally an emoji.
 */
const sendAnnouncement = (
  channelId: string,
  emojiName: string | null,
  message: string,
) => {
  const channel = getTextChannel(client, channelId)
  if (!channel) {
    console.warn(`Could not find text channel ${channelId}`)
    return
  }
  const emoji = emojiName
    ? channel.guild.emojis.cache.find(({ name }) => name === emojiName)
    : null
  void channel.send(
    `[${getUTCShort()}] ${emoji ? emoji.toString() + ' ' : ''}${message}`,
  )
}

client.on('ready', () => {
  console.log('Discord bot ready')

  streamingApi.init()

  streamingApi.on('PlayerLogin', ({ characterId }) => {
    if (characterId === constants.planetside.characterIds.bru) {
      sendAnnouncement(
        constants.discord.channelIds.brutracker,
        'spartan_helmet',
        'Bru is online!',
      )
    }
  })
  streamingApi.on('PlayerLogout', ({ characterId }) => {
    if (characterId === constants.planetside.characterIds.bru) {
      sendAnnouncement(
        constants.discord.channelIds.brutracker,
        'spartan_helmet',
        'Bru is offline.',
      )
    }
  })
})

client.on('error', (e) => {
  console.error('Discord bot error:', e)
})

client.on('message', (message: discord.Message) => {
  if (message.author === client.user) {
    return
  }

  const commandHandler = new CommandHandler<discord.Message>({
    prefix: '+',
    commands,
  })

  const reply = (text: string) => {
    if (text.length >= 2000) {
      const TOO_LONG = '... (message too long)'
      text = text.slice(0, 1999 - TOO_LONG.length) + TOO_LONG
    }
    void message.channel.send(text)
  }

  const commandMessage: CommandMessage<discord.Message> = {
    text: message.content,
    reply,
    author: {
      id: message.author.id,
      displayName: message.member?.displayName ?? message.author.username,
      mention: `<@${message.author.id}>`,
      admin:
        message.member?.hasPermission(
          discord.Permissions.FLAGS.ADMINISTRATOR,
        ) || false,
    },
    raw: message,
  }

  void commandHandler.process(commandMessage)
})

export const init = async (): Promise<void> => {
  await client.login(env.discordBotToken)
}

export const close = (): void => {
  console.log('Exiting Discord bot')
  client.destroy()
}

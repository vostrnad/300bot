import discord from 'discord.js'
import { env } from '@app/env'
import { constants } from '@app/global/constants'
import { log } from '@app/utils/log'
import { getUTCShort } from '@app/utils/time'
import { CommandHandler, CommandMessage } from '@commands/CommandHandler'
import { commands } from '@commands/index'
import { getTextChannel } from '@discord/utils'
import { streamingApi } from '@planetside/StreamingApi'

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
    log.warn(`Could not find text channel ${channelId}`)
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
  log.info('Discord bot ready')

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
  log.error('Discord bot error:', e)
})

client.on('message', (message: discord.Message) => {
  if (message.channel instanceof discord.DMChannel) {
    const recipient = message.channel.recipient
    const recipientTag = `${recipient.username}#${recipient.discriminator}`
    if (message.author === client.user) {
      log.verbose(`DM to ${recipientTag}: ${message.content}`)
    } else {
      log.verbose(`DM from ${recipientTag}: ${message.content}`)
    }
  }

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
  log.info('Exiting Discord bot')
  client.destroy()
}

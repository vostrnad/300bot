import discord from 'discord.js'
import { commands } from '@commands/index'
import { CommandHandler, CommandMessage } from '@commands/CommandHandler'
import { env } from '@app/env'

const client = new discord.Client()

client.on('ready', () => {
  console.log('Discord bot ready')
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

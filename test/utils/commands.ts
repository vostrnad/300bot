import discord from 'discord.js'
import {
  Command,
  CommandHandler,
  CommandMessage,
} from '@commands/CommandHandler'
import { Settings, SettingsParams } from '@commands/params'

export type TestDiscordParams = SettingsParams & {
  message: discord.Message | null
}

export const getCommandRunner = <T extends TestDiscordParams | SettingsParams>(
  command: Command<T>,
): ((text: string) => Promise<string | null>) => {
  const settings: Settings = {
    prefix: '+',
    outfitId: 'test-outfit-id',
  }
  return async (text) =>
    new Promise((resolve, reject) => {
      let replied = false
      const handler = new CommandHandler({
        prefix: settings.prefix,
        commands: [command],
      })

      const params: TestDiscordParams = {
        settings,
        updateSettings: (key, value) => {
          settings[key] = value
        },
        message: null,
      }

      const message: CommandMessage<T> = {
        text,
        author: {
          id: 'testrunner',
          displayName: 'Test Runner',
          permissions: {
            botAdmin: true,
            botManager: true,
            localAdmin: true,
          },
          mention: '@testrunner',
        },
        reply: (replyText) => {
          replied = true
          resolve(replyText)
        },
        params: params as T, // This only works because we're lucky enough that DiscordParams includes SettingsParams
      }
      void (async () => {
        try {
          await handler.process(message)
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!replied) {
            resolve(null)
          }
        } catch (e) {
          reject(e)
        }
      })()
    })
}

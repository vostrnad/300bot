import {
  Command,
  CommandHandler,
  CommandMessage,
} from '@commands/CommandHandler'
import { Settings, SettingsParams } from '@commands/params'

export const getCommandRunner = (
  command: Command<SettingsParams>,
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
      const message: CommandMessage<SettingsParams> = {
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
        params: {
          settings,
          updateSettings: (key, value) => {
            settings[key] = value
          },
        },
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

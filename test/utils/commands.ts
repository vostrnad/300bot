import { Command, CommandHandler } from '@commands/CommandHandler'
import { SettingsParams } from '@commands/params'

export const getCommandRunner = (command: Command<SettingsParams>) => {
  return async (text: string): Promise<string> =>
    new Promise((resolve) => {
      const handler = new CommandHandler({
        prefix: '+',
        commands: [command],
      })
      const message = {
        text,
        author: {
          id: 'testrunner',
          displayName: 'Test Runner',
          admin: true,
          mention: '@testrunner',
        },
        reply: resolve,
        params: {
          settings: {
            prefix: '+',
            outfitId: 'test-outfit-id',
          },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          updateSettings: async () => {},
        },
      }
      void handler.process(message)
    })
}

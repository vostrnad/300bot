import { Command, CommandHandler } from '@commands/CommandHandler'

export const getCommandRunner = (command: Command) => {
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
        raw: null,
      }
      void handler.process(message)
    })
}

export const getMultipleCommandRunner = (commands: Command[]) => {
  return async (text: string): Promise<string> =>
    new Promise((resolve) => {
      const handler = new CommandHandler({
        prefix: '+',
        commands: commands,
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
        raw: null,
      }
      void handler.process(message)
    })
}

import {
  Command,
  CommandConfig,
  CommandHandler,
  CommandHandlerConfig,
  CommandMessage,
} from './command-handler'

const dummyCommandConfig: CommandConfig = {
  keyword: 'testcommand',
  description: 'test description',
  help: 'no help for this one',
  callback: () => {
    // eslint-disable-next-line no-console
    console.warn('No callback defined for test command')
  },
}

const dummyCommandHandlerConfig: CommandHandlerConfig = {
  prefix: '+',
  commands: [],
}

const dummyCommandMessage: CommandMessage = {
  text: '+testcommand',
  author: {
    id: 'testrunner',
    displayName: 'Test Runner',
    mention: '@testrunner',
    permissions: {
      botAdmin: true,
      botManager: true,
      localAdmin: true,
    },
  },
  reply: () => null,
  params: null,
}

const testCommandHandler = async (
  commandConfig: Partial<CommandConfig>,
  commandMessage?: Partial<CommandMessage>,
  commandHandlerConfig?: Partial<CommandHandlerConfig>,
) => {
  const command = new Command({
    ...dummyCommandConfig,
    ...commandConfig,
  })
  const handler = new CommandHandler({
    ...dummyCommandHandlerConfig,
    ...commandHandlerConfig,
    commands: [command],
  })
  const message = {
    ...dummyCommandMessage,
    ...commandMessage,
  }
  return handler.process(message)
}

describe('CommandHandler', () => {
  it('should correctly process multiple arguments with more than one whitespace', async () => {
    let testArgs: string[] | null = null

    await testCommandHandler(
      {
        callback: ({ args }) => {
          testArgs = args
        },
      },
      {
        text: '+testcommand  a   ab abc  ',
      },
    )

    expect(testArgs).toEqual(['a', 'ab', 'abc'])
  })

  it('should pass 0 arguments even when lastArgNumber is set to 1', async () => {
    let testArgs: string[] | null = null

    await testCommandHandler({
      options: { lastArgNumber: 1 },
      callback: ({ args }) => {
        testArgs = args
      },
    })

    expect(testArgs).toEqual([])
  })
})

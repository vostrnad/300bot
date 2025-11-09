import { Command } from '@commands/command-handler'

export interface StaticCommandConfig {
  keyword: string
  alias?: string[]
  description: string
  help: string
  response: string
}

export class StaticCommand extends Command {
  constructor(config: StaticCommandConfig) {
    const { keyword, alias, description, help, response } = config
    super({
      keyword,
      alias,
      description,
      help,
      options: {
        hidden: true,
      },
      callback: ({ args, reply }) => {
        if (args.length > 0) return
        reply(response)
      },
    })
  }
}

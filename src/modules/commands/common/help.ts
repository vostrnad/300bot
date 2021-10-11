import { Command, commandCategories } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'

export default new Command({
  keyword: 'help',
  description: 'show command help',
  help: 'Usage:\n`{prefix}help` - shows all commands\n`{prefix}help <command>` - shows command help',
  category: 'Basic',
  callback: ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 1)
    if (args.length === 0) {
      const commands = env.handler
        .getPublicCommands('Basic')
        .map(
          (command) =>
            `**${env.handler.prefix}${command.keyword}** - ${command.description}`,
        )
      reply(
        `This is a list of all my basic commands:\n\n${commands.join('\n')}`,
      )
    } else if (args.length === 1) {
      let help: string | null = null

      if (
        args[0].toLowerCase() === 'full' ||
        commandCategories
          .map((catergory) => catergory.toLowerCase())
          .includes(args[0].toLowerCase())
      ) {
        help = ''
        help += `This is a list of all my ${
          args[0].toLowerCase() === 'full' ? '' : args[0].toLowerCase() + ' '
        }commands:\n\n`

        commandCategories
          .filter(
            (cat) =>
              args[0] === 'full' || cat.toLowerCase() === args[0].toLowerCase(),
          )
          .forEach((category) => {
            const brick = env.handler
              .getPublicCommands(category)
              .map(
                (command) =>
                  `**${env.handler.prefix}${command.keyword}** - ${command.description}`,
              )
            help += `__**${category}**__\n` + brick.join('\n') + '\n\n'
          })
      } else {
        help = env.handler.getCommandHelp(args[0])
      }

      if (help === null) {
        reply('There is no catergory or command with this name.')
      } else {
        reply(help)
      }
    }
  },
})

import { Command, commandCategories } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'

export default new Command({
  keyword: 'help',
  description: 'show command help',
  help: 'Usage:\n`{prefix}help` - shows all commands\n`{prefix}help <command>` - shows command help',
  category: 'Basic',
  callback: ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 1)

    // Show basic category by default unless specific argument is given
    let argument = 'Basic'
    if (args.length === 1) {
      argument = args[0]
    }

    let help: string | null = null

    if (
      argument.toLowerCase() === 'full' ||
      commandCategories
        .map((catergory) => catergory.toLowerCase())
        .includes(argument.toLowerCase())
    ) {
      help = ''
      help += `This is a list of all my ${
        argument.toLowerCase() === 'full' ? '' : argument.toLowerCase() + ' '
      }commands:\n\n`

      const keptCategories = commandCategories.filter(
        (category) =>
          argument === 'full' ||
          category.toLowerCase() === argument.toLowerCase(),
      )

      keptCategories.forEach((category) => {
        const brick = env.handler
          .getPublicCommands(category)
          .sort((com1, com2) => {
            if (com1.keyword < com2.keyword) {
              return -1
            }
            return 1
          })
          .map(
            (command) =>
              `**${env.handler.prefix}${command.keyword}** - ${command.description}`,
          )
        if (brick.length > 0) {
          help +=
            `${
              keptCategories.length === 1 ? '' : '__**' + category + '**__\n'
            }` +
            brick.join('\n') +
            '\n\n'
        }
      })

      // If help didn't change aka no command helps were added
      if (
        help ===
        `This is a list of all my ${
          argument.toLowerCase() === 'full' ? '' : argument.toLowerCase() + ' '
        }commands:\n\n`
      ) {
        help = null
      }
    } else {
      help = env.handler.getCommandHelp(argument)
    }

    if (help === null) {
      reply('There is no catergory or command with this name.')
    } else {
      reply(help)
    }
  },
})

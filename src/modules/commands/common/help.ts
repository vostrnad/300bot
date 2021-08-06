import { Command } from '@commands/CommandHandler'

export default new Command({
  keyword: 'help',
  description: 'show command help',
  help: 'Usage: `{prefix}help` - shows all commands',
  callback: ({ args, reply, env }) => {
    if (args.length === 0) {
      const commands = env.handler
        .getPublicCommands()
        .map(
          (command) =>
            `**${env.handler.prefix}${command.keyword}** - ${command.description}`,
        )
      reply(`This is a list of all my commands:\n\n${commands.join('\n')}`)
    } else if (args.length === 1) {
      const help = env.handler.getCommandHelp(args[0])
      if (help === null) {
        reply('There is no command with this name.')
      } else {
        reply(help)
      }
    } else {
      reply('Error: too many arguments.')
    }
  },
})

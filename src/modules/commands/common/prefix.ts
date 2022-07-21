import { Command } from '@commands/CommandHandler'
import { SettingsParams } from '@commands/params'
import { validateArgumentNumber } from '@commands/validators'

export default new Command<SettingsParams>({
  keyword: 'prefix',
  description: 'set command prefix',
  help: 'Usage: `{prefix}prefix <prefix>` - updates command prefix',
  callback: async ({ args, author, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    if (!author.admin) {
      return reply('You are not an admin or a bot operator in this server.')
    }

    await env.updateSettings('prefix', args[0])

    reply('Command prefix updated.')
  },
})

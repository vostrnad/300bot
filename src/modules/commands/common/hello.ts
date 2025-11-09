import { Command } from '@commands/command-handler'

export default new Command({
  keyword: 'hello',
  description: 'say hello',
  help: 'Usage: `{prefix}hello` - says hello',
  callback: ({ args, reply, author }) => {
    if (args.length > 0) return
    reply(`Hello ${author.displayName}!`)
  },
})

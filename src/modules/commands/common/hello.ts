import { Command } from '@commands/CommandHandler'

export default new Command({
  keyword: 'hello',
  description: 'say hello',
  help: 'Usage: `{prefix}hi` - say hello',
  callback: async ({ args, reply, author}) => {
  if (args.length > 0) return
  reply(`Hello ${author.displayName}!`)
  },
})

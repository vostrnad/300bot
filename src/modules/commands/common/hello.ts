import { Command } from '@commands/CommandHandler'

//Hello command responding with the name of the person
export default new Command({
  keyword: 'hello',
  description: 'say hello',
  help: 'Usage: `{prefix}hello` - say hello',
  callback: ({ args, reply, author }) => {
    if (args.length > 0) return
    reply(`Hello **${author.displayName}**!`)
  },
})

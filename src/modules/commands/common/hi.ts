import { Command } from '@commands/CommandHandler'

//Change to create a new branch
export default new Command({
  keyword: 'hi',
  description: 'Says hi!',
  help: 'Usage: `{prefix}hi` - says hi!',
  callback: ({ args, reply}) => {
    if (args.length === 0) {
      return reply('Hi!')
    }
  },
})

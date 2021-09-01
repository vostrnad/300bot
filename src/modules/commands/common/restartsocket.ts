import { Command } from '@commands/CommandHandler'
import { streamingApi } from '@planetside/StreamingApi'

export default new Command({
  keyword: 'restartsocket',
  description: 'restart Event Streaming socket',
  help: 'Usage: `{prefix}restartsocket` - restarts Event Streaming socket',
  options: {
    hidden: true,
  },
  callback: ({ args, author, reply }) => {
    if (args.length > 0) return
    if (!author.admin) {
      return reply('You are not an admin or a bot operator in this server.')
    }

    streamingApi.restart()
    return reply('Event Streaming socket restarted.')
  },
})

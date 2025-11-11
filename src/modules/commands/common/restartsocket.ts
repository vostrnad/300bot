import { Command } from '@commands/command-handler'
import { streamingApi } from '@planetside/streaming-api'

export default new Command({
  keyword: 'restartsocket',
  description: 'restart Event Streaming socket',
  help: 'Usage: `{prefix}restartsocket` - restarts Event Streaming socket',
  options: {
    hidden: true,
  },
  callback: ({ args, author, reply }) => {
    if (args.length > 0) return
    if (!author.permissions.botManager) {
      return reply('This command can only be used by bot managers.')
    }

    streamingApi.restart()
    return reply('Event Streaming socket restarted.')
  },
})

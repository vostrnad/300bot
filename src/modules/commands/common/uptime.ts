import { getLongTimeDelta } from '@app/utils/time'
import { Command } from '@commands/CommandHandler'

const startTime = new Date()

export default new Command({
  keyword: 'uptime',
  description: 'display time since last reboot',
  help: 'Usage: `{prefix}uptime` - displays time since last reboot',
  category: 'Advanced',
  callback: ({ args, reply }) => {
    if (args.length > 0) return
    const timeDelta = getLongTimeDelta(startTime, new Date())
    reply(`Time elapsed since last reboot: ${timeDelta}.`)
  },
})

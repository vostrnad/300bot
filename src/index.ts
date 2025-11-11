import { globalIntervals, globalTimeouts } from '@app/global/timeouts'
import { terminateAllPools } from '@app/workers'
import * as bot from '@discord/bot'
import { streamingApi } from '@planetside/streaming-api'

void bot.init()

process.on('SIGINT', () => {
  bot.close()
  streamingApi.destroy()

  globalTimeouts.forEach(clearTimeout)
  globalIntervals.forEach(clearInterval)

  void terminateAllPools()
})

import 'module-alias/register'
import 'source-map-support/register'
import { globalIntervals, globalTimeouts } from '@app/global/timeouts'
import { terminateAllPools } from '@app/workers'
import * as bot from '@discord/bot'
import { streamingApi } from '@planetside/StreamingApi'

void bot.init()

process.on('SIGINT', () => {
  bot.close()
  streamingApi.destroy()

  globalTimeouts.forEach(clearTimeout)
  globalIntervals.forEach(clearInterval)

  void terminateAllPools()
})

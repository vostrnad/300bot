import 'module-alias/register'
import 'source-map-support/register'
import * as bot from '@discord/bot'
import { streamingApi } from '@planetside/StreamingApi'

void bot.init()

process.on('SIGINT', () => {
  bot.close()
  streamingApi.destroy()
})

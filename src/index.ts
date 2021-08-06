import 'module-alias/register'
import * as bot from './modules/discord/bot'

void bot.init()

process.on('SIGINT', () => {
  bot.close()
})

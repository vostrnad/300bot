/* eslint-disable node/no-process-env */
import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../.env') })

export const env = {
  logLevel: process.env.LOG_LEVEL,
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  daybreakCensusServiceId: process.env.DAYBREAK_CENSUS_SERVICE_ID || 'example',
  altsServiceAddress: process.env.ALTS_SERVICE_ADDRESS || null,
  wordsServiceQuery: process.env.WORDS_SERVICE_QUERY || null,
}

/* eslint-disable node/no-process-env */
import { resolve } from 'path'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: resolve(__dirname, '../test/.env.test') })
} else {
  dotenv.config({ path: resolve(__dirname, '../.env') })
}

export const env = {
  logLevel: process.env.LOG_LEVEL,
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  daybreakCensusServiceId: process.env.DAYBREAK_CENSUS_SERVICE_ID || 'example',
  altsServiceAddress: process.env.ALTS_SERVICE_ADDRESS || null,
  wordsServiceQuery: process.env.WORDS_SERVICE_QUERY || null,
}

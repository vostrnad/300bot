import { resolve } from 'path'
import dotenv from 'dotenv'
import { log } from './utils/log'

dotenv.config({ path: resolve(__dirname, '../.env') })

const daybreakCensusServiceId =
  process.env.DAYBREAK_CENSUS_SERVICE_ID || 'example'
if (daybreakCensusServiceId === 'example') {
  log.warn('Using default Daybreak Census Service ID')
}

const altsServiceAddress = process.env.ALTS_SERVICE_ADDRESS || null
if (altsServiceAddress === null) {
  log.warn('Alts service not configured')
}

const wordsServiceQuery = process.env.WORDS_SERVICE_QUERY || null
if (wordsServiceQuery === null) {
  log.warn('Words service not configured')
}

export const env = {
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  daybreakCensusServiceId,
  altsServiceAddress,
  wordsServiceQuery,
}

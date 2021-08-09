import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../.env') })

const daybreakCensusServiceId =
  process.env.DAYBREAK_CENSUS_SERVICE_ID || 'example'
if (daybreakCensusServiceId === 'example') {
  console.warn('Using default Daybreak Census Service ID')
}

const altsServiceAddress = process.env.ALTS_SERVICE_ADDRESS || null
if (altsServiceAddress === null) {
  console.warn('Alts service not configured')
}

export const env = {
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  daybreakCensusServiceId,
  altsServiceAddress,
}

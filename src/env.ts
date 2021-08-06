import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../.env') })

const daybreakCensusServiceId =
  process.env.DAYBREAK_CENSUS_SERVICE_ID || 'example'
if (daybreakCensusServiceId === 'example') {
  console.warn('Using default Daybreak Census Service ID')
}

export const env = {
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  daybreakCensusServiceId,
}

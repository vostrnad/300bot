import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../.env') })

export const env = {
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  daybreakCensusServiceId: process.env.DAYBREAK_CENSUS_SERVICE_ID,
}

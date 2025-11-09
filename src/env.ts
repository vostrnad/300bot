/* eslint-disable n/no-process-env */
import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({
  quiet: true,
  path: resolve(
    import.meta.dirname,
    process.env.NODE_ENV === 'test' ? '../test/.env.test' : '../.env',
  ),
})

const databaseDirPath =
  process.env.NODE_ENV === 'test'
    ? resolve(
        import.meta.dirname,
        `../.data/test-${process.env.JEST_WORKER_ID || '0'}`,
      )
    : resolve(import.meta.dirname, '../.data')

export const env = {
  logLevel: process.env.LOG_LEVEL,
  databaseDirPath,
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  daybreakCensusServiceId: process.env.DAYBREAK_CENSUS_SERVICE_ID || 'example',
  altsServiceAddress: process.env.ALTS_SERVICE_ADDRESS || null,
  wordsServiceQuery: process.env.WORDS_SERVICE_QUERY || null,
}

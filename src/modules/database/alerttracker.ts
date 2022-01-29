import { KeyValueDatabase } from 'nodatabase'
import { env } from '@app/env'

/**
 * Database of Discord servers and their channels that are used for tracking
 * alerts.
 */
export const alertTrackerDatabase = new KeyValueDatabase<string>({
  dirPath: env.databaseDirPath,
  fileName: 'alerttracker',
  maxItems: 1000,
})

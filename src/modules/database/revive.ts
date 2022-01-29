import { DocumentDatabase } from 'nodatabase'
import { env } from '@app/env'

type Schema = {
  guildId: string
  userId: string
  reviveAt: number
}

/**
 * Database of Discord servers and their members that should have the dead role
 * removed at the given time.
 */
export const reviveDatabase = new DocumentDatabase<Schema>({
  dirPath: env.databaseDirPath,
  fileName: 'revive',
  indexedFields: ['guildId', 'userId'],
})

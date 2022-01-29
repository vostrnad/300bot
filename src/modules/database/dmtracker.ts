import { DocumentDatabase } from 'nodatabase'
import { env } from '@app/env'

type Schema = {
  characterId: string
  channelId: string
}

/**
 * Database of PlanetSide 2 characters and the Discord users that are tracking
 * them.
 */
export const dmTrackerDatabase = new DocumentDatabase<Schema>({
  dirPath: env.databaseDirPath,
  fileName: 'dmtracker',
  indexedFields: ['characterId', 'channelId'],
  maxDocuments: 100_000,
})

import { KeyValueDatabase } from 'nodatabase'
import { env } from '@app/env'

/**
 * Database of Bru's character ids in Planetside 2
 */
export const bruCharactersDatabase = new KeyValueDatabase<1>({
  dirPath: env.databaseDirPath,
  fileName: 'brucharacters',
})

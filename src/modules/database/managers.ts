import { KeyValueDatabase } from 'nodatabase'
import { env } from '@app/env'

export const managerDatabase = new KeyValueDatabase<1>({
  dirPath: env.databaseDirPath,
  fileName: 'managers',
})

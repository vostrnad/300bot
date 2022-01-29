import { KeyValueDatabase } from 'nodatabase'
import { env } from '@app/env'

type Schema = {
  prefix: string
}

export const guildDatabase = new KeyValueDatabase<Schema>({
  dirPath: env.databaseDirPath,
  fileName: 'guilds-v1',
})

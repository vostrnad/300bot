import { KeyValueDatabase } from 'nodatabase'
import { env } from '@app/env'

type Schema = {
  prefix?: string
  outfitId?: string
}

export const guildDatabase = new KeyValueDatabase<Schema>({
  dirPath: env.databaseDirPath,
  fileName: 'guilds-v1',
})

export const upsertGuild = async (
  guildId: string,
  update: Partial<Schema>,
): Promise<void> => {
  if (guildDatabase.has(guildId)) {
    await guildDatabase.update(guildId, update)
  } else {
    await guildDatabase.set(guildId, update)
  }
}

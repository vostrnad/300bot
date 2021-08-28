import { Database } from './Database'

type Schema = {
  [id in string]: {
    prefix: string
  }
}

export const guildDatabase = new Database<Schema>('guilds-v1')

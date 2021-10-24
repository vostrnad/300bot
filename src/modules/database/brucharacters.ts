import { Database } from './Database'

type Schema = Record<string, 1>

/**
 * Database of Bru's character ids in Planetside 2
 */
export const bruCharactersDatabase = new Database<Schema>('brucharacters')

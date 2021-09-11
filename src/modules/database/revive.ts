import { Database } from './Database'

type Schema = Record<string, Record<string, number>>

/**
 * Database of Discord servers and their members that should have the dead role
 * removed at the given time.
 * ```
 * {
 *   // server ID
 *   "197635243442700288": {
 *     // user ID
 *     "192539444836958208": 1631371503079
 *   }
 * }
 * ```
 */
export const reviveDatabase = new Database<Schema>('revive')

import { Database } from './Database'

type Schema = Record<string, Record<string, 1>>

/**
 * Database of PlanetSide 2 characters and the Discord users that are tracking
 * them. Example:
 * ```
 * {
 *   // character ID
 *   "8258984096545401457": {
 *     // user ID
 *     "192539444836958208": 1
 *   }
 * }
 * ```
 */
export const dmTrackerDatabase = new Database<Schema>('dmtracker')

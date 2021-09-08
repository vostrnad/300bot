import { Database } from './Database'

type Schema = {
  [id in string]: string
}

/**
 * Database of Discord servers and their channels that are used for tracking
 * alerts.
 */
export const alertTrackerDatabase = new Database<Schema>('alerttracker')

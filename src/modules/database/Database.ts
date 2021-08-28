import fs from 'fs'
import { resolve } from 'path'
import { Debounce } from '@app/utils/Debounce'
import { log } from '@app/utils/log'
import { Path, PathValue, PartialDeep } from '@app/utils/types'

type DatabaseRecord = { [key in string]: DatabaseRecord | string | number }

/**
 * A simple database that stores all its content in memory and writes every
 * update to a file.
 */
export class Database<T extends DatabaseRecord> {
  private static readonly _dirPath = resolve(__dirname, '../../../.data')
  private readonly _data: T
  private readonly _saveDb: Debounce

  constructor(dbName: string) {
    const filePath = resolve(Database._dirPath, `${dbName}.json`)

    // eslint-disable-next-line node/no-sync
    const fileExists = fs.existsSync(filePath)

    if (fileExists) {
      try {
        const saved = JSON.parse(
          // eslint-disable-next-line node/no-sync
          fs.readFileSync(filePath).toString(),
        ) as T
        this._data = saved
        log.debug(`Loaded '${dbName}' database from file`)
      } catch (e) {
        log.error('Cannot read database:', e)
        this._data = {} as T
      }
    } else {
      log.debug(`No '${dbName}' database file exists`)
      this._data = {} as T
    }

    this._saveDb = new Debounce(200, async () => {
      await fs.promises.writeFile(filePath, JSON.stringify(this._data))
    })
  }

  get<P extends Path<T>>(path: P): PartialDeep<PathValue<T, P>> | undefined {
    const steps = path.split('.')
    let ref: DatabaseRecord = this._data
    steps.forEach((step, index) => {
      if (index === steps.length - 1) return
      if (typeof ref[step] !== 'object') {
        ref[step] = {}
      }
      ref = ref[step] as DatabaseRecord
    })
    return ref[steps[steps.length - 1]] as PathValue<T, P>
  }

  async set<P extends Path<T>>(path: P, item: PathValue<T, P>): Promise<void> {
    const steps = path.split('.')
    let ref: DatabaseRecord = this._data
    steps.forEach((step, index) => {
      if (index === steps.length - 1) return
      if (typeof ref[step] !== 'object') {
        ref[step] = {}
      }
      ref = ref[step] as DatabaseRecord
    })
    ref[steps[steps.length - 1]] = item
    return this._saveDb.call()
  }

  async delete<P extends Path<T>>(path: P): Promise<void> {
    const steps = path.split('.')
    let ref: DatabaseRecord = this._data
    steps.forEach((step, index) => {
      if (index === steps.length - 1) return
      if (typeof ref[step] !== 'object') {
        ref[step] = {}
      }
      ref = ref[step] as DatabaseRecord
    })
    delete ref[steps[steps.length - 1]]
    return this._saveDb.call()
  }
}

// eslint-disable-next-line @typescript-eslint/dot-notation
fs.mkdirSync(Database['_dirPath'], { recursive: true })

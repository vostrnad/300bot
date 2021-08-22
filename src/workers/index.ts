import path from 'path'
import * as workerpool from 'workerpool'
import { log } from '@app/utils/log'

const withWorker = async (
  pathToScript: string,
  callback: (pool: workerpool.WorkerPool) => void | Promise<void>,
) => {
  const pool = workerpool.pool(pathToScript)
  try {
    await callback(pool)
  } catch (e) {
    log.error('Worker callback error:', e)
  }
  await pool.terminate()
}

const dirNameDist = path
  .resolve(__dirname)
  .replace(/(\/|\\)src(\/|\\)workers(\/|\\|$)/, '$1dist$2workers$3')

export const withMath = async (
  callback: (pool: workerpool.WorkerPool) => void | Promise<void>,
): Promise<void> => withWorker(path.join(dirNameDist, './math.js'), callback)

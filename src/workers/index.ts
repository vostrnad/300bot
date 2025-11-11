import path from 'path'
import * as workerpool from 'workerpool'

const dirNameDist = path
  .resolve(import.meta.dirname)
  .replace(/(\/|\\)src(\/|\\)workers(\/|\\|$)/, '$1dist$2workers$3')

const createWorkerPool = (scriptName: string) => {
  return workerpool.pool(path.join(dirNameDist, scriptName), { minWorkers: 1 })
}

export const pools = {
  math: createWorkerPool('./math.js'),
}

export const terminateAllPools = async (): Promise<void> => {
  await Promise.all(Object.values(pools).map(async (pool) => pool.terminate()))
}

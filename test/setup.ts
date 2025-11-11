import { globalIntervals, globalTimeouts } from '@app/global/timeouts'
import { terminateAllPools } from '@app/workers'

afterAll(async () => {
  globalTimeouts.forEach(clearTimeout)
  globalIntervals.forEach(clearInterval)

  await terminateAllPools()
})

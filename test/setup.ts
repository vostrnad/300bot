import { globalIntervals, globalTimeouts } from '@app/global/timeouts'
import { terminateAllPools } from '@app/workers'

afterAll(() => {
  globalTimeouts.forEach(clearTimeout)
  globalIntervals.forEach(clearInterval)

  void terminateAllPools()
})

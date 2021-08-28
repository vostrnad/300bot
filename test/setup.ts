import { resolve } from 'path'
import dotenv from 'dotenv'
import { globalIntervals, globalTimeouts } from '@app/global/timeouts'

dotenv.config({ path: resolve(__dirname, './.env.test') })

afterEach(() => {
  globalTimeouts.forEach(clearTimeout)
  globalIntervals.forEach(clearInterval)
})

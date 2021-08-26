import { randomInteger } from './random'
import { getLongTimeDelta } from './time'

describe('time.ts', () => {
  describe('getLongTimeDelta', () => {
    const getFromTimestamps = (t1: number, t2: number) => {
      const randomStart = randomInteger(1_000_000)
      return getLongTimeDelta(
        new Date(randomStart + t1),
        new Date(randomStart + t2),
      )
    }

    it('should work', () => {
      expect(getFromTimestamps(0, 0)).toEqual('0 seconds')
      expect(getFromTimestamps(0, 1000)).toEqual('1 second')
      expect(getFromTimestamps(0, 2000)).toEqual('2 seconds')
      expect(getFromTimestamps(0, 59 * 1000)).toEqual('59 seconds')
      expect(getFromTimestamps(0, 60 * 1000)).toEqual('1 minute and 0 seconds')
      expect(getFromTimestamps(0, 61 * 1000)).toEqual('1 minute and 1 second')
      expect(getFromTimestamps(0, 3599 * 1000)).toEqual(
        '59 minutes and 59 seconds',
      )
      expect(getFromTimestamps(0, 3600 * 1000)).toEqual(
        '1 hour, 0 minutes and 0 seconds',
      )
      expect(getFromTimestamps(0, 23 * 3600 * 1000 + 61 * 1000)).toEqual(
        '23 hours, 1 minute and 1 second',
      )
      expect(getFromTimestamps(0, 24 * 3600 * 1000)).toEqual(
        '1 day, 0 hours, 0 minutes and 0 seconds',
      )
      expect(getFromTimestamps(0, 1024 * 24 * 3600 * 1000)).toEqual(
        '1024 days, 0 hours, 0 minutes and 0 seconds',
      )
    })
  })
})

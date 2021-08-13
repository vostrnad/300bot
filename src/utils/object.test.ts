import { forEachKey } from './object'

describe('object.ts', () => {
  describe('forEachKey', () => {
    it('should iterate over key-value pairs', () => {
      const keys: string[] = []
      const values: number[] = []
      forEachKey(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        (value, key) => {
          keys.push(key)
          values.push(value)
        },
      )
      expect(keys).toEqual(['a', 'b', 'c'])
      expect(values).toEqual([1, 2, 3])
    })
  })
})

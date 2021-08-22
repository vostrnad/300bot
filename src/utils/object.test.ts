import { flatten, forEachKey } from './object'

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

  describe('flatten', () => {
    it('should flatten the input into key-value pairs', () => {
      const input = {
        foo1: { bar1: 'test1' },
        foo2: 'test2',
        foo3: { bar3: { test: 'value' }, bar31: 'test3' },
      }
      const output = [
        ['foo1.bar1', 'test1'],
        ['foo2', 'test2'],
        ['foo3.bar3.test', 'value'],
        ['foo3.bar31', 'test3'],
      ]
      expect(flatten(input)).toEqual(output)
    })

    it('should correctly expand inner arrays', () => {
      const input = {
        foo1: { bar1: ['test1', 'test2', 'test3'] },
        foo2: { bar2: 'test' },
      }
      const output = [
        ['foo1.bar1', 'test1'],
        ['foo1.bar1', 'test2'],
        ['foo1.bar1', 'test3'],
        ['foo2.bar2', 'test'],
      ]
      expect(flatten(input)).toEqual(output)
    })
  })
})

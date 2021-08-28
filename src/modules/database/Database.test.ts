import fs from 'fs'
import { resolve } from 'path'
import glob from 'glob'
import { Database } from './Database'

describe('Database', () => {
  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const dirPath = Database['_dirPath']
    const files = glob.sync('dbtest*.json', {
      cwd: dirPath,
    })
    // eslint-disable-next-line node/no-sync
    files.forEach((fileName) => fs.unlinkSync(resolve(dirPath, fileName)))
  })

  it('should allow setting a value', async () => {
    type Schema = {
      items: {
        [key in string]: {
          key1: string
          key2: number
        }
      }
    }
    const db = new Database<Schema>('dbtest1')
    await db.set('items.id.key1', 'test value')
    expect(db.get('items.id.key1')).toEqual('test value')
    expect(db.get('items.id.key2')).toBeUndefined()
  })

  it('should allow setting multiple values', async () => {
    type Schema = {
      key1: string
      key2: {
        key3: number
        key4: {
          key5: string
        }
      }
    }
    const db = new Database<Schema>('dbtest2')
    await Promise.all([
      db.set('key1', 'test1'),
      db.set('key2.key3', 2),
      db.set('key2.key4', { key5: 'test3' }),
    ])
    expect(db.get('key1')).toEqual('test1')
    expect(db.get('key2.key3')).toEqual(2)
    expect(db.get('key2.key4.key5')).toEqual('test3')
  })

  it('should return undefined for unset values', () => {
    const db = new Database('dbtest3')
    expect(db.get('key1')).toBeUndefined()
    expect(db.get('key2.key3')).toBeUndefined()
    expect(db.get('key4.key5.key6')).toBeUndefined()
  })

  it('should allow deleting an item', async () => {
    const db = new Database('dbtest4')
    await Promise.all([db.set('key1', 'value1'), db.set('key2', 'value2')])
    expect(db.get('key1')).toEqual('value1')
    expect(db.get('key2')).toEqual('value2')
    await db.delete('key1')
    expect(db.get('key1')).toBeUndefined()
    expect(db.get('key2')).toEqual('value2')
  })
})

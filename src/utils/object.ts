type StringObject = { [key: string]: string | string[] | StringObject }

/**
 * Flattens the object into an array of key-value pairs with paths that are
 * written in dot notation.
 *
 * e.g. `{ foo: { bar: 'test' }}` becomes `[['foo.bar', 'test']]`
 */
export const flatten = (
  query: StringObject,
  c = '',
): Array<[string, string]> => {
  const result: Array<[string, string]> = []
  for (const key in query) {
    const item = query[key]
    if (Array.isArray(item)) {
      item.forEach((subitem) => {
        result.push([(c + '.' + key).replace(/^\./, ''), subitem])
      })
    } else if (typeof item === 'string') {
      result.push([(c + '.' + key).replace(/^\./, ''), item])
    } else {
      result.push(...flatten(item, c + '.' + key))
    }
  }
  return result
}

export const forEachKey = <
  T extends Record<string, unknown>,
  K extends keyof T & string,
>(
  object: T,
  callback: (value: T[K], key: K) => void,
): void => {
  Object.keys(object).forEach((key) => {
    callback(object[key as K], key as K)
  })
}

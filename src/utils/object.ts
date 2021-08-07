type StringObject = { [key: string]: string | StringObject }

/**
 * Flattens the object into a collection of paths written in dot notation.
 *
 * e.g. `{ foo: { bar: 'test' }}` becomes `{ 'foo.bar': 'test' }`
 */
export const flatten = (
  query: StringObject,
  c = '',
): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const key in query) {
    const item = query[key]
    if (typeof item === 'object')
      Object.assign(result, flatten(item, c + '.' + key))
    else result[(c + '.' + key).replace(/^\./, '')] = item
  }
  return result
}

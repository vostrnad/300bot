export const generate = <T>(n: number, factory: (index: number) => T): T[] => {
  const array: T[] = []
  for (let i = 0; i < n; i++) {
    array.push(factory(i))
  }
  return array
}

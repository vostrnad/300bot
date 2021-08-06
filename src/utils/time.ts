export const getUTCShort = (): string => {
  const date = new Date()
  return `${date.getUTCHours()}:${date.getUTCMinutes()} UTC`
}

const padTime = (input: string | number) => {
  input = input.toString()
  while (input.length < 2) {
    input = '0' + input
  }
  return input
}

export const getUTCShort = (): string => {
  const date = new Date()
  const hours = padTime(date.getUTCHours())
  const minutes = padTime(date.getUTCMinutes())
  return `${hours}:${minutes} UTC`
}

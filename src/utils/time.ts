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

const months: Record<string, string | undefined> = {
  '1': 'January',
  '2': 'February',
  '3': 'March',
  '4': 'April',
  '5': 'May',
  '6': 'June',
  '7': 'July',
  '8': 'August',
  '9': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
}

export const getShortDate = (date: Date): string => {
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  const dayName =
    day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`
  const monthName = months[month.toString()] || 'unknown'
  return `${dayName} ${monthName} ${year}`
}

export const getShortAgo = (prev: Date, now: Date): string => {
  const delta = now.getTime() - prev.getTime()
  const seconds = Math.ceil(delta / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.ceil(minutes / 60)
  return `${hours}h ago`
}

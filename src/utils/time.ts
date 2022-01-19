import { pluralize, sentence } from './language'
import { divmod } from './math'

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

  const dayTrailDigit = day % 10

  const dayName =
    dayTrailDigit === 1
      ? `${day}st`
      : dayTrailDigit === 2
      ? `${day}nd`
      : dayTrailDigit === 3
      ? `${day}rd`
      : `${day}th`
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

export const getLongTimeDelta = (prev: Date, now: Date): string => {
  const delta = Math.floor((now.getTime() - prev.getTime()) / 1000)

  let [s, m, h, d] = [0, 0, 0, 0]

  ;[m, s] = divmod(delta, 60)
  ;[h, m] = divmod(m, 60)
  ;[d, h] = divmod(h, 24)

  const sw = pluralize(s, 'second')
  const mw = pluralize(m, 'minute')
  const hw = pluralize(h, 'hour')
  const dw = pluralize(d, 'day')

  let start = false
  const result: string[] = []

  const numbers = [d, h, m, s]
  const numberWords = [dw, hw, mw, sw]

  numbers.forEach((n: number, index: number) => {
    if (n > 0 || index === numberWords.length - 1) {
      start = true
    }
    if (start) {
      result.push(`${n} ${numberWords[index]}`)
    }
  })

  return sentence(result)
}

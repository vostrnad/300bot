import { globalTimeouts } from '@app/global/timeouts'

export const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => {
      globalTimeouts.delete(timeout)
      resolve()
    }, ms)
    globalTimeouts.add(timeout)
  })

export const schedule = async <T>(
  callback: () => T,
  ms: number,
): Promise<T> => {
  await sleep(ms)
  return callback()
}

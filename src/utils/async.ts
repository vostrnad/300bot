import { globalTimeouts } from '@app/global/timeouts'

export const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => {
      globalTimeouts.delete(timeout)
      resolve()
    }, ms)
    globalTimeouts.add(timeout)
  })

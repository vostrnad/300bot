import { sleep } from '@app/utils/async'

export class Debounce {
  private readonly _callback: () => void | Promise<void>
  private readonly _delay: number

  private _waitingResolvers: Array<[() => void, (e: unknown) => void]> = []
  private _active = false

  constructor(delay: number, calback: () => void | Promise<void>) {
    this._delay = delay
    this._callback = calback
  }

  async call(): Promise<void> {
    if (this._active) return this.addResolverAndGetPromise()
    this._active = true

    const promise = this.addResolverAndGetPromise()

    void (async () => {
      while (this._waitingResolvers.length > 0) {
        const resolvers = this._waitingResolvers
        this._waitingResolvers = []

        try {
          // eslint-disable-next-line no-await-in-loop
          await this._callback()
          resolvers.forEach(([resolve]) => resolve())
        } catch (e) {
          resolvers.forEach(([, reject]) => reject(e))
        }

        // eslint-disable-next-line no-await-in-loop
        await sleep(this._delay)
      }
      this._active = false
    })()

    return promise
  }

  private async addResolverAndGetPromise(): Promise<void> {
    return new Promise((resolve, reject) =>
      this._waitingResolvers.push([resolve, reject]),
    )
  }
}

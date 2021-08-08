export class TimeoutSet {
  private readonly _timeoutMs: number
  private readonly _lastUpdated: Record<string, number> = {}

  constructor(timeoutMs: number) {
    this._timeoutMs = timeoutMs

    setInterval(() => {
      const now = Date.now()
      Object.entries(this._lastUpdated).forEach(([key, lastUpdated]) => {
        if (now - lastUpdated >= this._timeoutMs) {
          delete this._lastUpdated[key]
        }
      })
    }, 30 * 1000)
  }

  add(key: string): void {
    this._lastUpdated[key] = Date.now()
  }

  remove(key: string): void {
    delete this._lastUpdated[key]
  }

  getAll(): Set<string> {
    const ret = new Set<string>()
    const now = Date.now()
    Object.entries(this._lastUpdated).forEach(([key, lastUpdated]) => {
      if (now - lastUpdated < this._timeoutMs) {
        ret.add(key)
      } else {
        delete this._lastUpdated[key]
      }
    })
    return ret
  }
}

export class ExponentialBackoff {
  private readonly _startDelay: number
  private readonly _maxDelay: number
  private _nextDelay: number

  constructor(startDelay: number, maxDelay: number) {
    this._startDelay = startDelay
    this._maxDelay = maxDelay

    this._nextDelay = this._startDelay
  }

  public reset(): void {
    this._nextDelay = this._startDelay
  }

  public getNextDelay(): number {
    const delay = this._nextDelay
    this._nextDelay = Math.min(this._nextDelay * 2, this._maxDelay)
    return delay
  }
}

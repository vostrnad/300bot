import Ws from 'ws'
import camelcaseKeys from 'camelcase-keys'
import { env } from '@app/env'
import { isRecord } from '@app/validators/object'

type EventMap = {
  PlayerLogin: {
    characterId: string
  }
  PlayerLogout: {
    characterId: string
  }
}

type Event = keyof EventMap

type EventListener<T extends EventMap[Event]> = (value: T) => void

class StreamingApi {
  private _serviceId: string
  private _client: Ws | null = null
  private _initialized = false
  private _destroyed = false
  private _listeners: { [E in Event]: Array<EventListener<EventMap[E]>> } = {
    PlayerLogin: [],
    PlayerLogout: [],
  }

  constructor(serviceId: string) {
    this._serviceId = serviceId
  }

  init() {
    if (this._initialized) return
    this._initialized = true
    this.connectToEventStreaming()
  }

  destroy() {
    if (!this._initialized || this._destroyed) return
    this._destroyed = true
    this._client?.close()
  }

  on<E extends Event>(event: E, listener: EventListener<EventMap[E]>) {
    this._listeners[event].push(listener)
  }

  private connectToEventStreaming() {
    this._client = new Ws(
      `wss://push.planetside2.com/streaming?environment=ps2&service-id=s:${this._serviceId}`,
    )

    this._client.on('open', () => {
      console.log('Streaming API client connected')

      let socketTimeout: NodeJS.Timeout

      const updateSocketTimeout = () => {
        clearTimeout(socketTimeout)
        socketTimeout = setTimeout(() => {
          console.warn('Restarting Streaming API')
          this._client?.close()
        }, 5 * 60 * 1000)
      }

      updateSocketTimeout()

      this._client?.send(
        `{"service":"event","action":"subscribe","worlds":["10"],"eventNames":["PlayerLogin","PlayerLogout"]}`,
      )

      this._client?.on('message', (message) => {
        let data
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data = camelcaseKeys(JSON.parse(message.toString()), { deep: true })
        } catch (e) {
          console.error('Error reading Streaming API message:', e)
          return
        }
        if (!isRecord(data) || !isRecord(data.payload)) return
        updateSocketTimeout()
        const payload = data.payload
        const eventName = payload.eventName
        if (typeof eventName !== 'string') return
        if (eventName in this._listeners) {
          this._listeners[eventName as Event].forEach((listener) =>
            listener(payload as EventMap[Event]),
          )
        }
      })

      this._client?.on('close', () => {
        console.error('Streaming API client closed')
        clearTimeout(socketTimeout)
        if (!this._destroyed) {
          setTimeout(() => {
            this.connectToEventStreaming()
          }, 1000)
        }
      })

      this._client?.on('error', (e) => {
        console.error('Streaming API client error:', e)
        this._client?.close()
      })
    })
  }
}

export const streamingApi = new StreamingApi(env.daybreakCensusServiceId)

import { camelCase } from 'camel-case'
import camelcaseKeys from 'camelcase-keys'
import { pascalCase } from 'pascal-case'
import Ws from 'ws'
import { env } from '@app/env'
import { log } from '@app/utils/log'
import { isRecord } from '@app/validators/object'

type EventMap = {
  playerLogin: {
    characterId: string
  }
  playerLogout: {
    characterId: string
  }
  achievementEarned: {
    characterId: string
    achievementId: string
  }
  gainExperience: {
    characterId: string
    otherId: string
    experienceId: string
  }
}

type Event = keyof EventMap

type EventListener<E extends Event> = (
  value: EventMap[E],
) => void | Promise<void>

class StreamingApi {
  private readonly _serviceId: string
  private _client: Ws | null = null
  private _initialized = false
  private _destroyed = false
  private readonly _listeners: { [E in Event]: Array<EventListener<E>> } = {
    playerLogin: [],
    playerLogout: [],
    achievementEarned: [],
    gainExperience: [],
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

  on<E extends Event>(event: E, listener: EventListener<E>) {
    const listeners = this._listeners[event] as Array<EventListener<E>>
    listeners.push(listener)
  }

  private connectToEventStreaming() {
    this._client = new Ws(
      `wss://push.planetside2.com/streaming?environment=ps2&service-id=s:${this._serviceId}`,
    )

    this._client.on('open', () => {
      log.info('Streaming API client connected')

      let socketTimeout: NodeJS.Timeout

      const updateSocketTimeout = () => {
        clearTimeout(socketTimeout)
        socketTimeout = setTimeout(() => {
          log.warn('Restarting Streaming API')
          this._client?.close()
        }, 5 * 60 * 1000)
      }

      updateSocketTimeout()

      const initialCommand = {
        service: 'event',
        action: 'subscribe',
        worlds: ['10'],
        characters: ['all'],
        logicalAndCharactersWithWorlds: true,
        eventNames: Object.keys(this._listeners).map((e) => pascalCase(e)),
      }

      this._client?.send(JSON.stringify(initialCommand))

      this._client?.on('message', (message) => {
        let data
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data = camelcaseKeys(JSON.parse(message.toString()), { deep: true })
        } catch (e) {
          log.error('Error reading Streaming API message:', e)
          return
        }
        if (!isRecord(data) || !isRecord(data.payload)) return
        updateSocketTimeout()
        const payload = data.payload
        if (typeof payload.eventName !== 'string') return
        const eventName = camelCase(payload.eventName)
        if (eventName in this._listeners) {
          this._listeners[eventName as Event].forEach((listener) => {
            void (async () => {
              try {
                // https://github.com/microsoft/TypeScript/issues/45373
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await listener(payload as any)
              } catch (e) {
                log.error('Error in StreamingApi listener:', e)
              }
            })()
          })
        }
      })

      this._client?.on('close', () => {
        log.info('Streaming API client closed')
        clearTimeout(socketTimeout)
        if (!this._destroyed) {
          setTimeout(() => {
            this.connectToEventStreaming()
          }, 1000)
        }
      })

      this._client?.on('error', (e) => {
        log.error('Streaming API client error:', e)
        this._client?.close()
      })
    })
  }
}

export const streamingApi = new StreamingApi(env.daybreakCensusServiceId)

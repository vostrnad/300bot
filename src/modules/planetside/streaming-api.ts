import { camelCase } from 'camel-case'
import camelcaseKeys from 'camelcase-keys'
import { pascalCase } from 'pascal-case'
import Ws from 'ws'
import { env } from '@app/env'
import { ExponentialBackoff } from '@app/utils/exponential-backoff'
import { log } from '@app/utils/log'
import { isRecord } from '@app/validators/object'

type EventMap = {
  playerLogin: {
    worldId: string
    characterId: string
  }
  playerLogout: {
    worldId: string
    characterId: string
  }
  achievementEarned: {
    worldId: string
    characterId: string
    achievementId: string
  }
  gainExperience: {
    worldId: string
    characterId: string
    otherId: string
    experienceId: string
  }
  continentLock: {
    worldId: string
    zoneId: string
  }
  continentUnlock: {
    worldId: string
    zoneId: string
  }
  metagameEvent: {
    worldId: string
    zoneId: string
    metagameEventId: string
    metagameEventState: string
    factionTr: string
    factionNc: string
    factionVs: string
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
  private readonly _backoff = new ExponentialBackoff(1000, 300 * 1000)
  private readonly _listeners: { [E in Event]: Array<EventListener<E>> } = {
    playerLogin: [],
    playerLogout: [],
    achievementEarned: [],
    gainExperience: [],
    continentLock: [],
    continentUnlock: [],
    metagameEvent: [],
  }

  constructor(serviceId: string) {
    this._serviceId = serviceId
  }

  init() {
    if (this._initialized) return
    this._initialized = true
    this.connectToEventStreaming()
  }

  restart() {
    this._client?.close()
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
    const client = new Ws(
      `wss://push.planetside2.com/streaming?environment=ps2&service-id=s:${this._serviceId}`,
    )
    this._client = client

    let socketTimeout: NodeJS.Timeout

    client.on('open', () => {
      log.info('Streaming API client connected')
      this._backoff.reset()

      const updateSocketTimeout = () => {
        clearTimeout(socketTimeout)
        socketTimeout = setTimeout(
          () => {
            log.warn('Restarting Streaming API')
            client.close()
          },
          5 * 60 * 1000,
        )
      }

      updateSocketTimeout()

      const initialCommand = {
        service: 'event',
        action: 'subscribe',
        worlds: ['all'],
        characters: ['all'],
        logicalAndCharactersWithWorlds: true,
        eventNames: Object.keys(this._listeners).map((e) => pascalCase(e)),
      }

      client.send(JSON.stringify(initialCommand))

      client.on('message', (message) => {
        let data
        try {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/no-unsafe-assignment
          data = camelcaseKeys(JSON.parse(message.toString()), { deep: true })
        } catch (e) {
          log.error('Error reading Streaming API message:', e)
          return
        }
        if (!isRecord(data) || !isRecord(data.payload)) return
        const payload = data.payload
        if (typeof payload.eventName !== 'string') return
        const eventName = camelCase(payload.eventName)
        if (eventName === 'gainExperience') {
          updateSocketTimeout()
        }
        if (eventName in this._listeners) {
          this._listeners[eventName as Event].forEach((listener) => {
            void (async () => {
              try {
                // https://github.com/microsoft/TypeScript/issues/45373
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                await listener(payload as any)
              } catch (e) {
                log.error('Error in StreamingApi listener:', e)
              }
            })()
          })
        }
      })
    })

    client.on('close', () => {
      log.info('Streaming API client closed')
      clearTimeout(socketTimeout)
      if (!this._destroyed) {
        const delay = this._backoff.getNextDelay()
        setTimeout(() => {
          this.connectToEventStreaming()
        }, delay)
      }
    })

    client.on('error', (e) => {
      log.error('Streaming API client error:', e)
      client.close()
    })
  }
}

export const streamingApi = new StreamingApi(env.daybreakCensusServiceId)

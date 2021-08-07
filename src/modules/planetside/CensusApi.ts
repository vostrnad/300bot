import got from 'got'
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { isRecord } from '@app/validators/object'
import { env } from '@app/env'

type CollectionMap = {
  characters_online_status: {
    characterId: string
    onlineStatus: string
  }
  outfit: {
    outfitId: string
    name: string
    nameLower: string
    alias: string
    aliasLower: string
    timeCreated: string
    timeCreatedDate: string
    leaderCharacterId: string
    memberCount: string
  }
  [other: string]: unknown
}

type Collection = keyof CollectionMap

class CensusApi {
  private _serviceId: string

  constructor(serviceId: string) {
    this._serviceId = serviceId
  }

  async getList<T extends Collection>(
    collection: T,
    /** All query keys will be converted to snake case. */
    query: Record<string, string>,
    /** All modifiers will be prefixed with `c:`. */
    modifiers?: Record<string, string>,
    joins?: string[],
  ): Promise<Array<CollectionMap[T]>> {
    const params = new URLSearchParams(snakecaseKeys(query))
    Object.entries(modifiers ?? {}).forEach(([modifier, value]) => {
      params.append(`c:${modifier}`, value)
    })
    joins?.forEach((join) => params.append('c:join', join))
    const queryString = params.toString()
    const url = `http://census.daybreakgames.com/s:${this._serviceId}/get/ps2:v2/${collection}?${queryString}`
    return got(url)
      .json()
      .then((data) => {
        if (!isRecord(data)) {
          return Promise.reject(new Error(`Unexpected query return type`))
        }
        if (data.error) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          return Promise.reject(new Error(`Query error: ${data.error}`))
        }
        if (data.errorCode) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          return Promise.reject(new Error(`Query error: ${data.errorCode}`))
        }
        const collectionListName = `${collection}_list`
        const list = data[collectionListName]
        if (!list) {
          return Promise.reject(
            new Error(`${collectionListName} not in result`),
          )
        }
        if (!Array.isArray(list)) {
          return Promise.reject(
            new Error(`${collectionListName} is not an array`),
          )
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return camelcaseKeys(list, { deep: true })
      })
  }

  async getCharactersOnlineStatus(characterId: string) {
    const list = await this.getList('characters_online_status', {
      characterId,
    })
    if (list.length === 0) return null
    return list[0].onlineStatus !== '0'
  }

  async getOnlineOutfitMembers(outfitId: string) {
    type Item = {
      characterId: string
      character: {
        name: { first: string }
        onlineStatus: string
      }
    }
    const list = (await this.getList(
      'outfit_member',
      {
        outfitId,
      },
      {
        show: 'character_id',
        limit: '65535',
      },
      [
        'character_name^on:character_id^inject_at:character^show:name.first',
        'characters_online_status^on:character_id^inject_at:character^show:name.first',
      ],
    )) as Item[]
    return list
      .filter((item) => item.character.onlineStatus !== '0')
      .map((item) => item.character.name.first)
      .sort((a, b) => Intl.Collator().compare(a, b))
  }

  async getOutfitMembersCount(outfitId: string) {
    const list = await this.getList('outfit', {
      outfitId,
    })
    if (list.length === 0) return null
    return list[0].memberCount
  }
}

export const censusApi = new CensusApi(env.daybreakCensusServiceId)

import got from 'got'
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { isRecord } from '@app/validators/object'
import { env } from '@app/env'
import { getFactionName } from './resources'

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
  title: {
    titleId: string
    name: { en: string }
  }
  world: {
    worldId: string
    name: { en: string }
  }
  [other: string]: unknown
}

type Collection = keyof CollectionMap

type QueryObject = { [key: string]: string | QueryObject }

const flatten = (query: QueryObject, c = '') => {
  const result: Record<string, string> = {}
  for (const key in query) {
    const item = query[key]
    if (typeof item === 'object')
      Object.assign(result, flatten(item, c + '.' + key))
    else result[(c + '.' + key).replace(/^\./, '')] = item
  }
  return result
}

class CensusApi {
  private _serviceId: string

  constructor(serviceId: string) {
    this._serviceId = serviceId
  }

  async getList<T extends Collection>(
    collection: T,
    /** All query keys will be converted to snake case. */
    query: QueryObject,
    /** All modifiers will be prefixed with `c:`. */
    modifiers?: Record<string, string>,
    joins?: string[],
  ): Promise<Array<CollectionMap[T]>> {
    const params = new URLSearchParams(flatten(snakecaseKeys(query)))
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

  async getDetailedCharacterByName(name: string) {
    type Item = {
      characterId: string
      name: { first: string; firstLower: string }
      factionId: string
      titleId: string
      times: { creation: string; lastLogin: string; minutesPlayed: string }
      battleRank: { value: string }
      prestigeLevel: string
      worldId: string
      onlineStatus: string
      outfitMember?: {
        leaderCharacterId: string
        name: string
        alias: string
        memberSince: string
      }
      stats?: {
        statHistory: Array<{ allTime: string }>
      }
    }
    const list = (await this.getList(
      'character',
      { name: { firstLower: name.toLowerCase() } },
      {
        resolve: 'world,outfit_member_extended,stat_history,online_status',
      },
    )) as Item[]
    if (list.length === 0) return null
    const character = list[0]
    const title = await this.getTitleById(character.titleId)
    const world = await this.getWorldById(character.worldId)
    return {
      name: character.name.first,
      faction: getFactionName(character.factionId),
      title: title?.name.en,
      creation: character.times.creation,
      lastLogin: character.times.lastLogin,
      minutesPlayed: character.times.minutesPlayed,
      battleRank: character.battleRank.value,
      prestigeLevel: character.prestigeLevel,
      world: world?.name.en,
      online: character.onlineStatus !== '0',
      outfit: character.outfitMember
        ? {
            name: character.outfitMember.name,
            alias: character.outfitMember.alias,
            memberSince: character.outfitMember.memberSince,
            isLeader:
              character.outfitMember.leaderCharacterId ===
              character.characterId,
          }
        : undefined,
      kills: character.stats?.statHistory[5].allTime,
      deaths: character.stats?.statHistory[2].allTime,
      score: character.stats?.statHistory[8].allTime,
    }
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
      { outfitId },
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

  async getOutfitFromId(outfitId: string) {
    const list = await this.getList('outfit', {
      outfitId,
    })
    if (list.length === 0) return null
    return list[0]
  }

  async getOutfitFromAlias(aliasLower: string) {
    const list = await this.getList('outfit', {
      aliasLower,
    })
    if (list.length === 0) return null
    return list[0]
  }

  async getTitleById(titleId: string) {
    if (titleId === '0') return null
    const list = await this.getList('title', { titleId })
    if (list.length === 0) return null
    return list[0]
  }

  async getWorldById(worldId: string) {
    const list = await this.getList('world', { worldId })
    if (list.length === 0) return null
    return list[0]
  }
}

export const censusApi = new CensusApi(env.daybreakCensusServiceId)

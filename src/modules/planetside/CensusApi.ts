import got from 'got'
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { isRecord } from '@app/validators/object'
import { env } from '@app/env'
import { flatten } from '@app/utils/object'
import { DeepPartial } from '@app/utils/types'
import { getFactionName } from './resources'
import {
  Character,
  CharacterResolvedOutfitMemberExtended,
  CharacterResolvedStatHistory,
  CharactersOnlineStatus,
  Outfit,
  OutfitMember,
  Title,
  World,
} from './types'

type CollectionMap = {
  character: Character
  characters_online_status: CharactersOnlineStatus
  outfit: Outfit
  outfit_member: OutfitMember
  title: Title
  world: World
}

type CollectionName = keyof CollectionMap

type QueryObject<T extends CollectionMap[keyof CollectionMap]> = DeepPartial<T>

class CensusApi {
  private _serviceId: string

  constructor(serviceId: string) {
    this._serviceId = serviceId
  }

  async getList<T extends CollectionName>(
    collection: T,
    /** All query keys will be converted to snake case. */
    query: QueryObject<CollectionMap[T]>,
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
    type Item = Character &
      CharacterResolvedOutfitMemberExtended &
      CharacterResolvedStatHistory & {
        worldId: string
        onlineStatus: string
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
      kills: character.stats?.statHistory[5].allTime ?? 0,
      deaths: character.stats?.statHistory[2].allTime ?? 0,
      score: character.stats?.statHistory[8].allTime ?? 0,
    }
  }

  async getCharactersStatsHistory(name: string) {
    type Item = Character & CharacterResolvedStatHistory
    const list = (await this.getList(
      'character',
      { name: { firstLower: name.toLowerCase() } },
      {
        resolve: 'stat_history',
      },
    )) as Item[]
    if (list.length === 0) return null
    const character = list[0]
    return {
      name: character.name.first,
      lastLogin: character.times.lastLogin,
      kills: character.stats?.statHistory[5] ?? null,
      deaths: character.stats?.statHistory[2] ?? null,
      score: character.stats?.statHistory[8] ?? null,
      seconds: character.stats?.statHistory[9] ?? null,
    }
  }

  async getCharacter(query: QueryObject<Character>) {
    const list = await this.getList('character', query)
    if (list.length === 0) return null
    const character = list[0]

    return character
  }

  async getOnlineOutfitMembers(outfitId: string) {
    type Item = OutfitMember & {
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

  async getOutfit(query: QueryObject<Outfit>) {
    const list = await this.getList('outfit', query)
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

import camelcaseKeys from 'camelcase-keys'
import got from 'got'
import { snakeCase } from 'snake-case'
import snakecaseKeys from 'snakecase-keys'
import { env } from '@app/env'
import {
  CensusApiNoDataFoundError,
  CensusApiUnavailableError,
} from '@app/errors'
import { log } from '@app/utils/log'
import { flatten, objectToArray } from '@app/utils/object'
import { QueryObjectDeep } from '@app/utils/types'
import { isRecord } from '@app/validators/object'
import { getFactionName } from '@planetside/resources'
import {
  Character,
  CharacterName,
  CharacterResolvedOutfitMemberExtended,
  CharacterResolvedStatHistory,
  CharacterStatHistoryStripped,
  CharacterWithOutfitWithLeader,
  CharacterWithOutfitWithLeaderAndOnlineStatus,
  CharactersItem,
  CharactersOnlineStatus,
  DirectiveTreeCategory,
  FullCharacterWeaponStats,
  Outfit,
  OutfitLeader,
  OutfitMember,
  OutfitMemberStats,
  PlayerDirective,
  Title,
  World,
} from './types'

type CollectionMap = {
  character: Character
  characterName: CharacterName
  charactersOnlineStatus: CharactersOnlineStatus
  outfit: Outfit
  outfitMember: OutfitMember
  title: Title
  world: World
  directiveTreeCategory: DirectiveTreeCategory
  charactersItem: CharactersItem
}

type CollectionName = keyof CollectionMap
type CollectionType = CollectionMap[keyof CollectionMap]

type QueryObject<T extends CollectionType> = QueryObjectDeep<T>

type QueryModifier =
  | 'show'
  | 'hide'
  | 'sort'
  | 'has'
  | 'resolve'
  | 'case'
  | 'limit'
  | 'limitPerDB'
  | 'start'
  | 'includeNull'
  | 'lang'
  | 'join'
  | 'tree'
  | 'exactMatchFirst'
  | 'distinct'

class CensusApi {
  private readonly _baseUrl: string

  constructor(serviceId: string) {
    this._baseUrl = `http://census.daybreakgames.com/s:${serviceId}/get/ps2:v2/`
  }

  async getList<T extends CollectionName>(
    /** Collection name will be converted to snake case. */
    collection: T,
    /** All query keys will be converted to snake case. */
    query: QueryObject<CollectionMap[T]>,
    /** All modifiers will be prefixed with `c:`. */
    modifiers?: Partial<Record<QueryModifier, string | string[]>>,
  ): Promise<Array<CollectionMap[T]>> {
    const collectionSnakeCase = snakeCase(collection)
    const params = new URLSearchParams(flatten(snakecaseKeys(query)))
    Object.entries(modifiers ?? {}).forEach(([modifier, values]) => {
      objectToArray(values).forEach((value) => {
        params.append(`c:${modifier}`, value)
      })
    })
    const queryString = params.toString()
    const url = `${this._baseUrl}${collectionSnakeCase}?${queryString}`
    return got(url)
      .json()
      .then((data) => {
        if (!isRecord(data)) {
          throw new Error('Unexpected query return type')
        }
        if (data.error) {
          switch (data.error) {
            case 'service_unavailable':
              throw new CensusApiUnavailableError()

            case 'No data found.':
              throw new CensusApiNoDataFoundError()

            default:
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              throw new Error(`Query error: ${data.error}`)
          }
        }
        if (data.errorCode) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`Query error: ${data.errorCode}`)
        }
        const collectionListName = `${collectionSnakeCase}_list`
        const list = data[collectionListName]
        if (!list) {
          throw new Error(`${collectionListName} not in result`)
        }
        if (!Array.isArray(list)) {
          throw new Error(`${collectionListName} is not an array`)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return camelcaseKeys(list, { deep: true })
      })
  }

  async getCharactersOnlineStatus(characterId: string) {
    const list = await this.getList('charactersOnlineStatus', {
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

  async getCharacterName(query: QueryObject<CharacterName>) {
    const list = await this.getList('characterName', query)
    if (list.length === 0) return null
    return list[0]
  }

  async getCharacterNameAndOnlineStatus(query: QueryObject<Character>) {
    const list = (await this.getList('character', query, {
      resolve: 'online_status',
      show: 'character_id,name,online_status',
    })) as Array<Character & CharactersOnlineStatus>
    if (list.length === 0) return null
    return list[0]
  }

  async getOnlineOutfitMembers(outfitId: string) {
    type Item = OutfitMember & {
      character: {
        name: { first: string }
        onlineStatus: string
      }
    }
    const list = (await this.getList(
      'outfitMember',
      { outfitId },
      {
        show: 'character_id',
        limit: '65535',
        join: [
          'character_name^on:character_id^inject_at:character^show:name.first',
          'characters_online_status^on:character_id^inject_at:character^show:name.first',
        ],
      },
    )) as Item[]
    return list
      .filter((item) => item.character.onlineStatus !== '0')
      .map((item) => item.character.name.first)
      .sort((a, b) => Intl.Collator().compare(a, b))
  }

  async getPlayerNames(ids: string[]) {
    const list = await this.getList(
      'characterName',
      {
        characterId: ids.join(','),
      },
      { limit: '100' },
    )
    return list.reduce((prev, curr) => {
      prev[curr.characterId] = curr
      return prev
    }, {} as Record<string, CharacterName>)
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

  async getOutfitMembersStats(aliasLower: string) {
    const list = (await this.getList(
      'outfit',
      { aliasLower },
      {
        limit: '65535',
        join: [
          "outfit_member^on:outfit_id^list:1^inject_at:members^show:character_id(character^on:character_id^inject_at:character^show:name.first'stats'times.last_login'times.minutes_played'prestige_level(characters_stat_history^on:character_id^list:1^inject_at:stats^show:stat_name'all_time))",
          "character^on:leader_character_id^to:character_id^inject_at:leader^show:name.first'faction_id",
        ],
      },
    )) as Array<Outfit & OutfitMemberStats & OutfitLeader>

    if (list.length === 0) return null
    return list[0]
  }

  async getPlayerDirective(characterID: string, category: string) {
    const list = (await this.getList(
      'directiveTreeCategory',
      category !== ''
        ? {
            name: {
              en: category,
            },
          }
        : {},
      {
        join: [
          `directive_tree^on:directive_tree_category_id^inject_at:directive_tree^list:1^show:name.en'directive_tree_id(characters_directive_tier^on:directive_tree_id^terms:character_id=${characterID}^list:1^inject_at:directive_tier^show:completion_time'directive_tier_id)`,
        ],
        show: 'name.en,directive_tree_category_id',
        limit: '65535',
      },
    )) as PlayerDirective[]

    if (list.length === 0) return null
    return list
  }

  async getPlayerWeaponStats(characterId: string) {
    const list = (await this.getList(
      'charactersItem',
      { characterId },
      {
        join: [
          `item^inject_at:item`,
          `characters_weapon_stat^on:item_id^outer:0^terms:character_id=${characterId}^inject_at:weapon_stats^list:1`,
          `characters_weapon_stat_by_faction^on:item_id^outer:0^terms:character_id=${characterId}^inject_at:weapon_stats_by_faction^list:1`,
        ],
        lang: 'en',
        limit: '65535',
      },
    )) as FullCharacterWeaponStats[]

    if (list.length === 0) return null
    return list
  }

  async getOutfitMembersStatsById(outfitId: string) {
    const list = (await this.getList(
      'outfitMember',
      { outfitId },
      {
        limit: '65535',
        join: [
          "character^on:character_id^inject_at:character^show:name.first'stats'times.last_login'times.minutes_played'prestige_level(characters_stat_history^on:character_id^list:1^inject_at:stats^show:stat_name'all_time)",
        ],
      },
    )) as Array<OutfitMember & CharacterStatHistoryStripped>

    if (list.length === 0) return null
    return list
  }

  async getCharacterOutfitLeaderFaction(query: QueryObject<Character>) {
    const list = (await censusApi.getList('character', query, {
      join: 'outfit_member^show:outfit_id^inject_at:outfit_member(outfit^inject_at:outfit^show:leader_character_id(character^on:leader_character_id^to:character_id^show:faction_id^inject_at:leader))',
    })) as CharacterWithOutfitWithLeader[]
    if (list.length === 0) return null
    const character = list[0]

    return character
  }

  async getCharactersWithOutfitLeaderAndOnlineStatus(
    query: QueryObject<Character>,
  ) {
    const list = (await censusApi.getList('character', query, {
      join: 'outfit_member^show:outfit_id^inject_at:outfit_member(outfit^inject_at:outfit^show:leader_character_id(character^on:leader_character_id^to:character_id^show:faction_id^inject_at:leader))',
      resolve: 'online_status',
    })) as CharacterWithOutfitWithLeaderAndOnlineStatus[]
    if (list.length === 0) return null

    return list
  }
}

if (env.daybreakCensusServiceId === 'example') {
  log.warn('Using default Daybreak API service ID')
}

export const censusApi = new CensusApi(env.daybreakCensusServiceId)

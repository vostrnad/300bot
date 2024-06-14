import { constants } from '@app/global/constants'
import { TimeoutSet } from '@app/utils/TimeoutSet'
import { sentence } from '@app/utils/language'
import { isDefined } from '@app/validators'
import { Command } from '@commands/CommandHandler'
import { validateArgumentRange } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { streamingApi } from '@planetside/StreamingApi'
import { getServerByName } from '@planetside/resources'
import { Character, Outfit } from '@planetside/types'

const squadLeaders: { [worldId: number]: TimeoutSet } = {}
const platoonLeaders: { [worldId: number]: TimeoutSet } = {}

streamingApi.init()
streamingApi.on(
  'achievementEarned',
  ({ worldId, characterId, achievementId }) => {
    const worldIdInt = Number(worldId)
    if (achievementId === '90039' || achievementId === '90040') {
      if (!(worldIdInt in squadLeaders)) {
        squadLeaders[worldIdInt] = new TimeoutSet(1800 * 1000)
      }
      squadLeaders[worldIdInt].add(characterId)
    }
    if (achievementId === '90041' || achievementId === '90042') {
      if (!(worldIdInt in platoonLeaders)) {
        platoonLeaders[worldIdInt] = new TimeoutSet(1800 * 1000)
      }
      platoonLeaders[worldIdInt].add(characterId)
    }
  },
)
streamingApi.on('playerLogout', ({ worldId, characterId }) => {
  const worldIdInt = Number(worldId)
  if (worldIdInt in squadLeaders) {
    squadLeaders[worldIdInt].remove(characterId)
  }
  if (worldIdInt in platoonLeaders) {
    platoonLeaders[worldIdInt].remove(characterId)
  }
})

export default new Command({
  keyword: 'whoisleading',
  description: 'check who is leading',
  help: 'Usage:\n`{prefix}whoisleading` - checks who is leading\n`{prefix}whoisleading <server>` - checks who is leading in a specific server\n`{prefix}whoisleading full` - always includes squad leaders',
  callback: async ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 2)

    let worldId = constants.planetside.worldIds.miller
    let worldName = 'Miller'
    let showFull = false

    if (args.length > 0) {
      let argsProcessed = 0

      if (args.includes('full')) {
        showFull = true
        argsProcessed++
      }

      const serverArgs = args
        .map((arg) => getServerByName(arg))
        .filter(isDefined)

      if (serverArgs.length > 0) {
        if (serverArgs.length > 1) {
          return reply('Error: Cannot search multiple servers at once.')
        }

        ;[worldId, worldName] = serverArgs[0]
        argsProcessed++
      }

      if (argsProcessed !== args.length) {
        return reply(env.command.getHelp(env.handler))
      }
    }

    let squadLeaderIds = new Set()
    let platoonLeaderIds = new Set()
    if (Number(worldId) in squadLeaders) {
      squadLeaderIds = squadLeaders[worldId].getAll()
    }
    if (Number(worldId) in platoonLeaders) {
      platoonLeaderIds = platoonLeaders[worldId].getAll()
    }
    // const squadLeaderIds = squadLeaders[worldId].getAll()
    // const platoonLeaderIds = platoonLeaders[worldId].getAll()
    const allIds = [
      ...Array.from(squadLeaderIds),
      ...Array.from(platoonLeaderIds),
    ]

    if (allIds.length === 0) {
      return reply('Nobody is leading on any faction at the moment.')
    }

    type CharacterWithOutfit = Character & { outfit?: Outfit }

    const list = (
      await censusApi.getList(
        'character',
        {
          characterId: allIds.join(','),
        },
        {
          show: 'character_id,name.first,faction_id',
          resolve: 'outfit',
        },
      )
    ).sort((a, b) =>
      Intl.Collator().compare(a.name.first, b.name.first),
    ) as CharacterWithOutfit[]

    if (list.length === 0) {
      return reply(
        `Nobody is leading on any faction at the moment on ${worldName}.`,
      )
    }

    type FactionCode = 'vs' | 'nc' | 'tr'
    type LeaderType = 'squad' | 'platoon'
    const factions: Record<
      FactionCode,
      Record<LeaderType, CharacterWithOutfit[]>
    > = {
      tr: {
        squad: [],
        platoon: [],
      },
      nc: {
        squad: [],
        platoon: [],
      },
      vs: {
        squad: [],
        platoon: [],
      },
    }

    for (const character of list) {
      let factionCode: FactionCode
      if (character.factionId === '1') factionCode = 'vs'
      else if (character.factionId === '2') factionCode = 'nc'
      else if (character.factionId === '3') factionCode = 'tr'
      else continue

      let leaderType: LeaderType
      if (platoonLeaderIds.has(character.characterId)) leaderType = 'platoon'
      else if (squadLeaderIds.has(character.characterId)) leaderType = 'squad'
      else continue // should never happen

      factions[factionCode][leaderType].push(character)
    }

    const formatLeaderName = (character: CharacterWithOutfit) => {
      const outfitAliasPrefix = character.outfit?.alias
        ? `[${character.outfit.alias}] `
        : ''
      return `**${outfitAliasPrefix}${character.name.first}**`
    }

    let message = `Current leaders on ${worldName}:\n`
    for (const factionCode of ['tr', 'nc', 'vs'] as const) {
      const factionName = factionCode.toUpperCase()
      const faction = factions[factionCode]

      if (faction.platoon.length > 0) {
        const formattedLeaders = faction.platoon.map(formatLeaderName)
        message += `${factionName} platoon leaders: ${sentence(
          formattedLeaders,
        )}.\n`
      }

      if (
        faction.squad.length > 0 &&
        (faction.platoon.length === 0 || showFull)
      ) {
        const formattedLeaders = faction.squad.map(formatLeaderName)
        message += `${factionName} squad leaders: ${sentence(
          formattedLeaders,
        )}.\n`
      }

      if (faction.platoon.length === 0 && faction.squad.length === 0) {
        message += `Nobody is leading on ${factionName} at the moment.\n`
      }
    }

    return reply(message)
  },
})

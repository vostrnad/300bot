import { TimeoutSet } from '@app/utils/TimeoutSet'
import { sentence } from '@app/utils/language'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { streamingApi } from '@planetside/StreamingApi'

const squadLeaders = new TimeoutSet(1800 * 1000)
const platoonLeaders = new TimeoutSet(1800 * 1000)

streamingApi.init()
streamingApi.on('achievementEarned', ({ characterId, achievementId }) => {
  if (achievementId === '90039' || achievementId === '90040') {
    squadLeaders.add(characterId)
  }
  if (achievementId === '90041' || achievementId === '90042') {
    platoonLeaders.add(characterId)
  }
})
streamingApi.on('playerLogout', ({ characterId }) => {
  squadLeaders.remove(characterId)
  platoonLeaders.remove(characterId)
})

export default new Command({
  keyword: 'whoisleading',
  description: 'check who is leading',
  help: 'Usage: `{prefix}whoisleading` - checks who is leading',
  callback: async ({ args, reply }) => {
    if (args.length > 0) return

    const squadLeaderIds = squadLeaders.getAll()
    const platoonLeaderIds = platoonLeaders.getAll()
    const allIds = [
      ...Array.from(squadLeaderIds),
      ...Array.from(platoonLeaderIds),
    ]

    if (allIds.length === 0) {
      return reply('Nobody is leading on any faction at the moment.')
    }

    const list = (
      await censusApi.getList(
        'character',
        {
          characterId: allIds.join(','),
        },
        {
          show: 'character_id,name.first,faction_id',
        },
      )
    ).sort((a, b) => Intl.Collator().compare(a.name.first, b.name.first))

    if (list.length === 0) {
      return reply('Nobody is leading on any faction at the moment.')
    }

    type FactionCode = 'vs' | 'nc' | 'tr'
    type LeaderType = 'squad' | 'platoon'
    const factions: Record<FactionCode, Record<LeaderType, string[]>> = {
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

      factions[factionCode][leaderType].push(character.name.first)
    }

    let message = ''
    for (const factionCode of ['tr', 'nc', 'vs'] as const) {
      const factionName = factionCode.toUpperCase()
      const faction = factions[factionCode]
      if (faction.platoon.length > 0) {
        const formattedLeaders = faction.platoon.map((name) => `**${name}**`)
        message += `${factionName} platoon leaders: ${sentence(
          formattedLeaders,
        )}.\n`
      } else if (faction.squad.length > 0) {
        const formattedLeaders = faction.squad.map((name) => `**${name}**`)
        message += `${factionName} squad leaders: ${sentence(
          formattedLeaders,
        )}.\n`
      } else {
        message += `Nobody is leading on ${factionName} at the moment.\n`
      }
    }

    return reply(message)
  },
})

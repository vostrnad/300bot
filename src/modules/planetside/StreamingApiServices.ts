import { getUTCShort } from '@app/utils/time'
import { dmTrackerDatabase } from '@database/dmtracker'
import { client } from '@discord/client'
import { formatWithEmojis, getDMChannel, getTextChannel } from '@discord/utils'
import { censusApi } from '@planetside/CensusApi'
import { streamingApi } from '@planetside/StreamingApi'
import {
  getAlertType,
  getAlertState,
  getContinentName,
} from '@planetside/resources'
import { alertTrackerDatabase } from '../database/alerttracker'

export const startTrackingService = (): void => {
  const sendCharacterStatus = async (characterId: string, online: boolean) => {
    const channelIds = dmTrackerDatabase.get(characterId)
    if (!channelIds) return
    const character = await censusApi.getCharacterName({ characterId })
    if (!character) return
    const characterName = character.name.first
    const message = online
      ? `**${characterName}** is online!`
      : `**${characterName}** is offline.`
    Object.keys(channelIds).forEach((channelId) => {
      void (async () => {
        const channel = await getDMChannel(client, channelId)
        if (channel) {
          void channel.send(message)
        }
      })()
    })
  }

  streamingApi.on('playerLogin', async ({ characterId }) => {
    await sendCharacterStatus(characterId, true)
  })
  streamingApi.on('playerLogout', async ({ characterId }) => {
    await sendCharacterStatus(characterId, false)
  })
}

export const startAlertTrackerService = (): void => {
  const sendAlertMessage = (message: string) => {
    message = `[${getUTCShort()}] ${message}`
    const channelIds = Object.values(alertTrackerDatabase.root)
    channelIds.forEach((channelId) => {
      const channel = getTextChannel(client, channelId)
      if (channel) {
        void channel.send(formatWithEmojis(channel, message))
      }
    })
  }

  streamingApi.on('continentLock', ({ zoneId }) => {
    const continentName = getContinentName(zoneId)
    if (!continentName) return
    sendAlertMessage(`:lock: **${continentName}** has been locked.`)
  })
  streamingApi.on('continentUnlock', ({ zoneId }) => {
    const continentName = getContinentName(zoneId)
    if (!continentName) return
    sendAlertMessage(`:unlock: **${continentName}** has been unlocked.`)
  })
  streamingApi.on('metagameEvent', (event) => {
    const alertType = getAlertType(event.metagameEventId)
    const alertState = getAlertState(event.metagameEventState)
    if (!alertType || !alertState) return
    const [continentName, factionAlias] = alertType

    const factionData = [
      {
        alias: 'TR',
        emoji: '{emoji:faction_logo_tr}',
        emojiWithFallback: '{emoji:faction_logo_tr|**TR**}',
        result: Math.floor(Number(event.factionTr)),
      },
      {
        alias: 'NC',
        emoji: '{emoji:faction_logo_nc}',
        emojiWithFallback: '{emoji:faction_logo_nc|**NC**}',
        result: Math.floor(Number(event.factionNc)),
      },
      {
        alias: 'VS',
        emoji: '{emoji:faction_logo_vs}',
        emojiWithFallback: '{emoji:faction_logo_vs|**VS**}',
        result: Math.floor(Number(event.factionVs)),
      },
    ]

    if (alertState === 'started') {
      const faction = factionData.find((item) => item.alias === factionAlias)
      if (!faction) return
      sendAlertMessage(
        `${faction.emoji} **${faction.alias}** have started an alert on **${continentName}** with **${faction.result}%** territory control.`,
      )
    } else {
      const factionResults = factionData
        .map(
          ({ emojiWithFallback, result }) =>
            `${emojiWithFallback} **${result}%**`,
        )
        .join(' ')

      sendAlertMessage(
        `:rotating_light: The alert on **${continentName}** has ended: ${factionResults}`,
      )
    }
  })
}

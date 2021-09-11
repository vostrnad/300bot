import discord from 'discord.js'
import { getUTCShort } from '@app/utils/time'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { alertTrackerDatabase } from '@database/alerttracker'
import { client } from '@discord/client'
import { formatWithEmojis, getTextChannel } from '@discord/utils'
import { streamingApi } from '@planetside/StreamingApi'
import {
  getAlertType,
  getAlertState,
  getContinentName,
} from '@planetside/resources'

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

streamingApi.init()
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

export default new Command<discord.Message>({
  keyword: 'alerttracker',
  description: 'configure the alert tracker',
  help: 'Usage: `{prefix}alerttracker <on/off>` - turns the alert tracker on or off',
  callback: async ({ args, reply, env, raw }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const option = args[0]
    if (option !== 'on' && option !== 'off') {
      return reply('Error: The argument must be either "on" or "off".')
    }
    const channel = raw.channel
    if (!(channel instanceof discord.TextChannel)) {
      return reply('Error: This type of channel is not supported.')
    }

    const dbPath = `${channel.guild.id}` as const
    const currentChannelId = alertTrackerDatabase.get(dbPath)

    if (option === 'on') {
      if (channel.id === currentChannelId) {
        return reply('Alert tracker is already on in this channel.')
      } else {
        await alertTrackerDatabase.set(dbPath, channel.id)
        return reply('Alert tracker is now on in this channel.')
      }
    } else {
      if (currentChannelId === undefined) {
        return reply('Alert tracker is already turned off.')
      } else {
        await alertTrackerDatabase.delete(dbPath)
        return reply('Alert tracker is now turned off.')
      }
    }
  },
})

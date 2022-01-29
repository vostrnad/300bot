import discord from 'discord.js'
import { PlayerNotFoundError } from '@app/errors'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { dmTrackerDatabase } from '@database/dmtracker'
import { client } from '@discord/client'
import { getDMChannel } from '@discord/utils'
import { censusApi } from '@planetside/CensusApi'
import { streamingApi } from '@planetside/StreamingApi'
import { validatePlayerName } from '@planetside/validators'

const sendCharacterStatus = async (characterId: string, online: boolean) => {
  const subscriptions = dmTrackerDatabase.findMany({ characterId })
  if (subscriptions.length === 0) return
  const character = await censusApi.getCharacterName({ characterId })
  if (!character) return
  const characterName = character.name.first
  const message = online
    ? `**${characterName}** is online!`
    : `**${characterName}** is offline.`
  subscriptions.forEach(({ channelId }) => {
    void (async () => {
      const channel = await getDMChannel(client, channelId)
      if (channel) {
        void channel.send(message)
      }
    })()
  })
}

streamingApi.init()
streamingApi.on('playerLogin', async ({ characterId }) => {
  await sendCharacterStatus(characterId, true)
})
streamingApi.on('playerLogout', async ({ characterId }) => {
  await sendCharacterStatus(characterId, false)
})

export default new Command<discord.Message>({
  keyword: 'track',
  alias: ['donottrack'],
  description: 'track PlanetSide 2 characters',
  help: 'Usage:\n`{prefix}track <character>` - starts tracking character\n`{prefix}donottrack <character>` - stops tracking character',
  callback: async ({ alias, args, reply, env, raw }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    validatePlayerName(args[0])
    const channel = raw.channel
    if (!(channel instanceof discord.DMChannel)) {
      return reply('This command can only be used in direct messages.')
    }

    const character = await censusApi.getCharacterName({
      name: { firstLower: args[0].toLowerCase() },
    })
    if (character === null) throw new PlayerNotFoundError()

    const characterName = character.name.first
    const dbItem = {
      characterId: character.characterId,
      channelId: channel.id,
    }

    if (alias === 'track') {
      if (dmTrackerDatabase.findOne(dbItem)) {
        return reply(`You are already tracking **${characterName}**.`)
      }
      await dmTrackerDatabase.insert(dbItem)
      return reply(`Started tracking **${characterName}**.`)
    } else {
      if (!dmTrackerDatabase.findOne(dbItem)) {
        return reply(`You are not currently tracking **${characterName}**.`)
      }
      await dmTrackerDatabase.delete(dbItem)
      return reply(`Stopped tracking **${characterName}**.`)
    }
  },
})

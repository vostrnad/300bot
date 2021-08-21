import path from 'path'
import camelcaseKeys from 'camelcase-keys'
import discord from 'discord.js'
import got from 'got'
import { env as appEnv } from '@app/env'
import { PlayerNotFoundError } from '@app/errors'
import { constants } from '@app/global/constants'
import { pluralize, sentence } from '@app/utils/language'
import { Command } from '@commands/CommandHandler'
import { validateArgumentNumber } from '@commands/validators'
import { censusApi } from '@planetside/CensusApi'
import { validatePlayerName } from '@planetside/validators'

type AltsServiceSuccess = {
  names: string[]
  itemCount: number
}

type AltsServiceError = {
  error: string
}

type AltsServiceResponse = AltsServiceSuccess | AltsServiceError

export default new Command<discord.Message>({
  keyword: 'alts',
  description: "show player's alts",
  help: "Usage: `{prefix}alts <player name>` - shows player's alts",
  callback: async ({ args, reply, env, raw }) => {
    if (args.length === 0) return reply(env.command.getHelp(env.handler))
    validateArgumentNumber(args.length, 1)

    const characterName = args[0]
    validatePlayerName(characterName)

    if (!appEnv.altsServiceAddress) {
      return reply('The alts service is not configured.')
    }

    const list = await censusApi.getList('characterName', {
      name: { firstLower: characterName.toLowerCase() },
    })
    if (list.length === 0) throw new PlayerNotFoundError()
    const character = list[0]

    const url = path.posix.join(
      appEnv.altsServiceAddress,
      'alts',
      character.characterId,
    )
    const response = (await got(url)
      .json()
      .then((data) => {
        return camelcaseKeys(data as Record<string, unknown>, { deep: true })
      })) as AltsServiceResponse

    if ('error' in response) {
      if (response.error === 'NOT_ENOUGH_ITEMS') {
        return reply(
          `Unfortunately, it is not possible to discover alts for **${character.name.first}**.`,
        )
      } else {
        return reply('This command is temporarily unavailable.')
      }
    }

    const alts = response.names
      .filter((name) => name.toLowerCase() !== characterName.toLowerCase())
      .sort((a, b) => Intl.Collator().compare(a, b))

    if (alts.length === 0) {
      return reply(`No alts found for **${character.name.first}**.`)
    }

    const disclaimer = response.itemCount < 6 ? ' *probable*' : ''
    const altsWord = pluralize(alts.length, 'alt')
    const altsFormatted = alts.map((alt) => `**${alt}**`)

    const textBase = `Found ${alts.length}${disclaimer} ${altsWord} for **${character.name.first}**`
    const textShort = `${textBase}.`
    const textLong = `${textBase}: ${sentence(altsFormatted)}.`

    if (raw.author.id === constants.discord.userIds.alfav) {
      return reply(textLong)
    } else {
      const sent = await raw.channel.send(textShort)
      await sent.react(constants.discord.emojis.checkMark)
      const collector = sent.createReactionCollector(
        (reaction: discord.MessageReaction, user: discord.User) =>
          reaction.emoji.toString() === constants.discord.emojis.checkMark &&
          user.id === constants.discord.userIds.alfav,
        {
          max: 1,
          time: 86400 * 1000,
        },
      )
      collector.on('collect', () => {
        void sent.edit(textLong)
      })
    }
  },
})

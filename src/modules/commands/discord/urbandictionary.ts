import { Command } from '@commands/CommandHandler'
import got from 'got'
import { isRecord } from '@app/validators/object'
import camelcaseKeys from 'camelcase-keys'
import discord from 'discord.js'
import { constants } from '@app/global/constants'
import { mod } from '@app/utils/math'
import { log } from '@app/utils/log'

type Definition = {
  definition: string
  permalink: string
  thumbsUp: number
  soundUrls: string[]
  author: string
  word: string
  defid: number
  currentVote: string
  writtenOn: string
  example: string
  thumbsDown: number
}

export default new Command<discord.Message>({
  keyword: 'urbandictionary',
  description: 'get the modern definition of a word or expression',
  help: 'Usage: `{prefix}urbandictionary [expression]` - get the modern definition of a word or expression',
  alias: ['ud'],
  options: {
    lastArgNumber: 1,
  },
  callback: async ({ args, reply, env, raw }) => {
    async function removeReaction(reaction: discord.MessageReaction) {
      try {
        await reaction.users.remove(raw.author)
      } catch (error) {
        log.error('Error removing reaction:', error)
      }
    }

    function genDefinitionEmbed(
      definition: Definition,
      len: number,
    ): discord.MessageEmbed {
      const definitionEmbed = new discord.MessageEmbed()
        .setColor('#647CC4')
        .setTitle(`${definition.word} (N°${defN + 1}/${len})`)
        .setURL(definition.permalink)
        .setAuthor('Urban dictionary', '', 'https://www.urbandictionary.com')
        .setThumbnail('https://i.imgur.com/A6nvY85.png')
        .addFields(
          {
            name: 'Definition',
            value:
              definition.definition.length !== 0
                ? definition.definition.replace(/\[|\]/g, '*')
                : '**No definition**',
          },
          {
            name: 'Example',
            value:
              definition.example.length !== 0
                ? definition.example.replace(/\[|\]/g, '*')
                : '**No example**',
          },
        )
        .addField('Written on', definition.writtenOn.substring(0, 10), true)
        .addField('Thumbs up', definition.thumbsUp, true)
        .addField('Thumbs down', definition.thumbsDown, true)
        .setFooter('Interactive')
        .setTimestamp()

      return definitionEmbed
    }

    if (args.length === 0) return reply(env.command.getHelp(env.handler))

    const timeout = 10 * 60 * 1000 //10 minutes

    const word = args[0]

    const url = `http://api.urbandictionary.com/v0/define?term=${word}`

    let list = (await got(url)
      .json()
      .then((data) => {
        if (!isRecord(data)) {
          return Promise.reject(new Error(`Unexpected query return type`))
        }

        const definitions = data.list
        if (!definitions) {
          return Promise.reject(new Error(`List not in result`))
        }
        if (!Array.isArray(definitions)) {
          return Promise.reject(new Error(`List is not an array`))
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return camelcaseKeys(definitions, { deep: true })
      })) as Definition[]

    const DEF_TOO_LONG = '... (definition too long)'
    const EX_TOO_LONG = '... (example too long)'

    list.forEach((def) => {
      if (def.definition.length >= 1024) {
        def.definition =
          def.definition.slice(0, 1023 - DEF_TOO_LONG.length) + DEF_TOO_LONG
      }
      if (def.example.length >= 1024) {
        def.example =
          def.example.slice(0, 1023 - EX_TOO_LONG.length) + EX_TOO_LONG
      }
    })

    const wordString = word.includes(' ') ? 'Expression' : 'Word'

    if (list.length === 0)
      return reply(
        `${wordString} **${word}** does not exist in urban dictionary.`,
      )

    list = list.sort((a: Definition, b: Definition) => {
      if (b.thumbsUp - b.thumbsDown > a.thumbsUp - a.thumbsDown) return 1
      else return -1
    })

    let defN = 0

    let definitionEmbed = genDefinitionEmbed(list[defN], list.length)

    if (list.length === 1) {
      definitionEmbed.setFooter('Interaction ended').setColor('#1D2439')

      await raw.channel.send({ embed: definitionEmbed })

      return
    }

    const embedMessage = await raw.channel.send({ embed: definitionEmbed })

    await embedMessage.react(constants.discord.emojis.arrow_left)
    await embedMessage.react(constants.discord.emojis.arrow_right)

    const collector = embedMessage.createReactionCollector(
      (reaction: discord.MessageReaction, user: discord.User) =>
        [
          constants.discord.emojis.arrow_left,
          constants.discord.emojis.arrow_right,
        ].includes(reaction.emoji.name) && user.id === raw.author.id,
      {
        time: timeout,
      },
    )

    collector.on('collect', (reaction: discord.MessageReaction) => {
      if (reaction.emoji.name === constants.discord.emojis.arrow_right)
        defN = mod(defN + 1, list.length)

      if (reaction.emoji.name === constants.discord.emojis.arrow_left)
        defN = mod(defN - 1, list.length)

      void (async () => {
        await removeReaction(reaction)

        definitionEmbed = genDefinitionEmbed(list[defN], list.length)

        definitionEmbed.setTimestamp()
        await embedMessage.edit({ embed: definitionEmbed })
      })()
    })

    collector.on('end', () => {
      definitionEmbed
        .setFooter('Interaction ended')
        .setColor('#1D2439')
        .setTimestamp()
      void embedMessage.edit({ embed: definitionEmbed })
    })
  },
})

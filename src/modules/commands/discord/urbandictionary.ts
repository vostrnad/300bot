import camelcaseKeys from 'camelcase-keys'
import discord from 'discord.js'
import got from 'got'
import { isRecord } from '@app/validators/object'
import { Command } from '@commands/CommandHandler'
import { DiscordParams } from '@commands/params'
import { sendScrollEmbed } from '@discord/embed'

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

export default new Command<DiscordParams>({
  keyword: 'urbandictionary',
  description: 'get the modern definition of a word or expression',
  help: 'Usage: `{prefix}urbandictionary [expression]` - get the modern definition of a word or expression',
  alias: ['ud'],
  options: {
    lastArgNumber: 1,
  },
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) return reply(env.command.getHelp(env.handler))

    const word = args[0]

    const url = `http://api.urbandictionary.com/v0/define?term=${word}`

    let list = (await got(url)
      .json()
      .then((data) => {
        if (!isRecord(data)) {
          throw new Error(`Unexpected query return type`)
        }

        const definitions = data.list
        if (!definitions) {
          throw new Error(`List not in result`)
        }
        if (!Array.isArray(definitions)) {
          throw new Error(`List is not an array`)
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

    if (list.length === 0) {
      return reply(
        `${wordString} **${word}** does not exist in urban dictionary.`,
      )
    }

    list = list.sort((a: Definition, b: Definition) => {
      if (b.thumbsUp - b.thumbsDown > a.thumbsUp - a.thumbsDown) return 1
      else return -1
    })

    return sendScrollEmbed(env.message, list, (definition, index, active) => {
      const definitionEmbed = new discord.MessageEmbed()
        .setTitle(`${definition.word} (N°${index + 1}/${list.length})`)
        .setURL(definition.permalink)
        .setAuthor('Urban dictionary', '', 'https://www.urbandictionary.com')
        .setThumbnail('https://i.imgur.com/A6nvY85.png')
        .addFields(
          {
            name: 'Definition',
            value:
              definition.definition.length > 0
                ? definition.definition.replace(/\[|\]/g, '*')
                : '**No definition**',
          },
          {
            name: 'Example',
            value:
              definition.example.length > 0
                ? definition.example.replace(/\[|\]/g, '*')
                : '**No example**',
          },
        )
        .addField('Written on', definition.writtenOn.slice(0, 10), true)
        .addField('Thumbs up', definition.thumbsUp, true)
        .addField('Thumbs down', definition.thumbsDown, true)
        .setTimestamp()

      if (active) {
        definitionEmbed.setFooter('Interactive').setColor('#647CC4')
      } else {
        definitionEmbed.setFooter('Interaction ended').setColor('#1D2439')
      }

      return definitionEmbed
    })
  },
})

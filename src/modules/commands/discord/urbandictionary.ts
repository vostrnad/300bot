import { Command } from '@commands/CommandHandler'
import got from 'got'
import { isRecord } from '@app/validators/object'
import camelcaseKeys from 'camelcase-keys'
import discord from 'discord.js'
import { constants } from '@app/global/constants'

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
  help: 'Usage: `{prefix}urbandictionary <expression>` - get the modern definition of a word or expression',
  alias: ['ud'],
  options: {
    lastArgNumber: 1,
  },
  callback: async ({ args, reply, env, raw }) => {
    if (args.length === 0) return reply(env.command.getHelp(env.handler))

    const timeout = 10 * 60 * 1000

    const word = args[0]

    const url = `http://api.urbandictionary.com/v0/define?term=${word}`

    let list = (await got(url)
      .json()
      .then((data) => {
        if (!isRecord(data)) {
          return Promise.reject(
            new Error(`Unexp    definitionEmbed.setFooter('Interaction ended').setColor('#1D2439')
          await embedMessage.edit({ embed: definitionEmbed })ected query return type`),
          )
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

    const re = /\[|\]/g

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
    const definitionEmbed = new discord.MessageEmbed()
      .setColor('#647CC4')
      .setTitle(`${list[defN].word} (N°${defN + 1}/${list.length})`)
      .setURL(list[defN].permalink)
      .setAuthor('Urban dictionary', '', 'https://www.urbandictionary.com')
      .setThumbnail('https://i.imgur.com/A6nvY85.png')
      .addFields(
        {
          name: 'Definition',
          value: list[defN].definition.replace(re, '*'),
        },
        { name: 'Example', value: list[defN].example.replace(re, '*') },
      )
      .addField('Written on', list[defN].writtenOn, true)
      .addField('Thumbs up', list[defN].thumbsUp, true)
      .addField('Thumbs down', list[defN].thumbsDown, true)
      .setFooter('Interactive')
      .setTimestamp()

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

    setTimeout(() => {
      definitionEmbed
        .setFooter('Interaction ended')
        .setColor('#1D2439')
        .setTimestamp()
      void embedMessage.edit({ embed: definitionEmbed })
    }, timeout)

    collector.on('collect', (reaction) => {
      if (reaction.emoji.name === constants.discord.emojis.arrow_right) {
        try {
          void reaction.users.remove(raw.author)
        } catch (error) {
          console.log(error)
        }
        defN += 1
        if (defN + 1 > list.length) {
          defN = 0
        }
      }

      if (reaction.emoji.name === constants.discord.emojis.arrow_left) {
        try {
          void reaction.users.remove(raw.author)
        } catch (error) {
          console.log(error)
        }
        defN += -1
        if (defN <= 0) {
          defN = list.length - 1
        }
      }

      definitionEmbed.setTitle(
        `${list[defN].word} (N°${defN + 1}/${list.length})`,
      )

      definitionEmbed.fields[0] = {
        name: 'Definition',
        value: list[defN].definition.replace(re, '*'),
        inline: false,
      }
      definitionEmbed.fields[1] = {
        name: 'Example',
        value: list[defN].example.replace(re, '*'),
        inline: false,
      }

      definitionEmbed.fields[2] = {
        name: 'Written on',
        value: list[defN].writtenOn,
        inline: true,
      }

      definitionEmbed.fields[3] = {
        name: 'Thumbs up',
        value: list[defN].thumbsUp.toString(),
        inline: true,
      }

      definitionEmbed.fields[4] = {
        name: 'Thumbs down',
        value: list[defN].thumbsDown.toString(),
        inline: true,
      }

      definitionEmbed.setTimestamp()
      void embedMessage.edit({ embed: definitionEmbed })
    })
  },
})

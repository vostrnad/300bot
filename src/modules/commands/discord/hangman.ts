/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Command } from '@commands/CommandHandler'
import discord from 'discord.js'
import { validateArgumentNumber } from '../validators'
import got from 'got'
import camelcaseKeys from 'camelcase-keys'
import { isRecord } from '@app/validators/object'

type Word = {
  word: string
  definition: string
  pronunciation: string
}

export default new Command<discord.Message>({
  keyword: 'hangman',
  description: 'play a hangman game',
  help: 'Usage: `{prefix}hangman` - play a hangman game',
  callback: async ({ reply, args, raw, env }) => {
    validateArgumentNumber(args.length, 0)

    const hangmanPics = [
      `  +---+
  |   |
      |
      |
      |
      |
=========`,

      `  +---+
  |   |
  O   |
      |
      |
      |
=========`,
      `  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
      `  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
      `  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
      `  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
      `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
    ]

    function genHangmanEmbed(
      wordDisplay: string,
      guesses: string,
      tries: number,
    ): discord.MessageEmbed {
      const wordEmbed = new discord.MessageEmbed()
        .setColor('#647CC4')
        .setTitle(`Hangman game`)
        //.setImage('https://i.imgur.com/AfFp7pu.png')
        .addField('Word', wordDisplay)
        .setFooter('Interactive')
        .setTimestamp()

      if (guesses !== '') wordEmbed.addField('Guesses', guesses)
      else wordEmbed.addField('Guesses', 'No guesses yet')

      wordEmbed.addField('Hanging bru', '`' + hangmanPics[tries] + '`')

      return wordEmbed
    }

    function setCharAt(str: string, index: number, chr: string) {
      if (index > str.length - 1) return str
      return str.substring(0, index) + chr + str.substring(index + 1)
    }

    //Find a random word

    const url = `https://random-words-api.vercel.app/word`

    const word = (await got(url)
      .json()
      .then((data) => {
        if (!isRecord(data)) {
          return Promise.reject(new Error(`Unexpected query return type`))
        }
        if (!Array.isArray(data)) {
          return Promise.reject(new Error(`List is not an array`))
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return camelcaseKeys(data[0], { deep: true })
      })) as Word

    //Display embed
    reply(word.word)

    let guesses = ''
    let tries = 0
    let lettersDiscovered = 0

    let wordDisplay = '🔵'.repeat(word.word.length)

    let hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
    const embedMessage = await raw.channel.send({
      embed: hangmanEmbed,
    })

    //Listen for inputs
    const filter = (m: discord.Message) =>
      m.content.length === 1 ||
      m.content.toUpperCase() === word.word.toUpperCase()

    const messageCollector = raw.channel.createMessageCollector(filter)

    const otherGameStart = raw.channel.createMessageCollector(
      (m: discord.Message) =>
        m.content === `${env.handler.prefix}${env.command.keyword}`,
    )

    messageCollector.on('collect', (m: discord.Message) => {
      console.log(`Collected ${m.content}`)
      if (!guesses.includes(m.content.toUpperCase()))
        guesses += m.content.toUpperCase()

      if (word.word.toLowerCase().includes(m.content.toLowerCase())) {
        for (let k = 0; k < word.word.length; k++) {
          if (word.word.charAt(k).toLowerCase() === m.content.toLowerCase()) {
            lettersDiscovered += 1
            wordDisplay = setCharAt(wordDisplay, k * 2, m.content.toUpperCase())
          }
        }
      }

      hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
      void embedMessage.edit({ embed: hangmanEmbed })

      if (
        lettersDiscovered === word.word.length ||
        m.content.toUpperCase() === word.word.toUpperCase()
      ) {
        hangmanEmbed
          .setFooter(`Game won by ${m.author.username}`)
          .setColor('#1D2439')
          .setTimestamp()
        void embedMessage.edit({ embed: hangmanEmbed })
        messageCollector.stop()
        otherGameStart.stop()
      } else {
        tries += 1
      }

      if (tries >= hangmanPics.length) {
        hangmanEmbed = genHangmanEmbed(word.word, guesses, tries)
        hangmanEmbed.setFooter(`Game lost`).setColor('#1D2439').setTimestamp()
        void embedMessage.edit({ embed: hangmanEmbed })
        messageCollector.stop()
        otherGameStart.stop()
      }

      void (async () => {
        await m.delete()
      })()
    })

    otherGameStart.on('collect', () => {
      hangmanEmbed
        .setFooter('Game aborted due to new game starting in this channel')
        .setColor('#1D2439')
        .setTimestamp()
      void embedMessage.edit({ embed: hangmanEmbed })
      messageCollector.stop()
      otherGameStart.stop()
    })
  },
})

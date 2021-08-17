import { Command } from '@commands/CommandHandler'
import discord from 'discord.js'
import { validateArgumentNumber } from '../validators'
import { hangmanWordsList } from '@app/global/english_words'
import { randomInteger } from '@app/utils/random'

// type Word = {
//   word: string
//   definition: string
//   pronunciation: string
// }

export default new Command<discord.Message>({
  keyword: 'hangman',
  description: 'play a hangman game',
  help: 'Usage: `{prefix}hangman` - play a hangman game',
  callback: async ({ args, raw, env }) => {
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

    // const url = `https://random-words-api.vercel.app/word`

    // const word = (await got(url)
    //   .json()
    //   .then((data) => {
    //     if (!isRecord(data)) {
    //       return Promise.reject(new Error(`Unexpected query return type`))
    //     }
    //     if (!Array.isArray(data)) {
    //       return Promise.reject(new Error(`List is not an array`))
    //     }
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    //     return camelcaseKeys(data[0], { deep: true })
    //   })) as Word

    //Display embed
    //reply(word)

    const word = hangmanWordsList[randomInteger(hangmanWordsList.length)]

    //reply(word)

    let guesses = ''
    let tries = 0
    let lettersDiscovered = 0

    let won = false

    let wordDisplay = '🔵'.repeat(word.length)

    let hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
    const embedMessage = await raw.channel.send({
      embed: hangmanEmbed,
    })

    //Listen for inputs
    const filter = (m: discord.Message) =>
      m.content.length === 1 || m.content.length === word.length

    const messageCollector = raw.channel.createMessageCollector(filter)

    const otherGameStart = raw.channel.createMessageCollector(
      (m: discord.Message) =>
        m.content === `${env.handler.prefix}${env.command.keyword}`,
    )

    messageCollector.on('collect', (m: discord.Message) => {
      let correctGuess = false
      console.log(`Collected ${m.content}`)
      if (!guesses.includes(m.content.toUpperCase()) && m.content.length === 1)
        guesses += m.content.toUpperCase()

      if (
        m.content.length === 1 &&
        word.toLowerCase().includes(m.content.toLowerCase())
      ) {
        correctGuess = true
        for (let k = 0; k < word.length; k++) {
          if (word.charAt(k).toLowerCase() === m.content.toLowerCase()) {
            lettersDiscovered += 1
            wordDisplay = setCharAt(wordDisplay, k * 2, m.content.toUpperCase())
          }
        }
      }

      if (
        lettersDiscovered === word.length ||
        m.content.toUpperCase() === word.toUpperCase()
      ) {
        correctGuess = true
        won = true
        wordDisplay = word
      }

      if (!correctGuess) tries += 1

      hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
      void embedMessage.edit({ embed: hangmanEmbed })

      if (tries >= hangmanPics.length - 1) {
        hangmanEmbed = genHangmanEmbed(word, guesses, tries)
        hangmanEmbed.setFooter(`Game lost`).setColor('#1D2439').setTimestamp()
        void embedMessage.edit({ embed: hangmanEmbed })
        messageCollector.stop()
        otherGameStart.stop()
      }

      void (async () => {
        await m.delete()
      })()

      if (won) {
        hangmanEmbed
          .setFooter(`Game won by ${m.author.username}`)
          .setColor('#1D2439')
          .setTimestamp()
        void embedMessage.edit({ embed: hangmanEmbed })
        messageCollector.stop()
        otherGameStart.stop()
      }
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

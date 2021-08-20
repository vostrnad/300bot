import { Command } from '@commands/CommandHandler'
import discord from 'discord.js'
import { validateArgumentRange } from '../validators'
import { randomInteger } from '@app/utils/random'
import hangmanp2WordsList from '@app/global/wordlists/hangmanp2WordsList.json'
import hangmanWordsList from '@app/global/wordlists/hangmanWordsList.json'
import hangmanNsfwWordsList from '@app/global/wordlists/hangmanNsfwWordsList.json'

const activeChannels = new Set()

export default new Command<discord.Message>({
  keyword: 'hangman',
  description: 'play a hangman game',
  help: 'Usage:\n`{prefix}hangman` - play a normal hangman game\n`{prefix}hangman nsfw` - play a nsfw hangman game\n`{prefix}hangman ps2` - play a hangman game with planetide words',
  options: {
    lastArgNumber: 1,
  },
  callback: async ({ args, raw, reply }) => {
    validateArgumentRange(args.length, 0, 1)

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

    let word = hangmanWordsList[randomInteger(hangmanWordsList.length)]

    if (args.length === 1) {
      switch (args[0]) {
        case 'nsfw': {
          word =
            hangmanNsfwWordsList[randomInteger(hangmanNsfwWordsList.length)]
          break
        }
        case 'ps2': {
          word = hangmanp2WordsList[randomInteger(hangmanp2WordsList.length)]
          break
        }
        default: {
          return reply('Unknown words list.')
          break
        }
      }
    }

    if (activeChannels.has(raw.channel.id))
      return reply('A game of hangman is already running in this channel.')

    activeChannels.add(raw.channel.id)

    let guesses = ''
    let tries = 0
    let lettersDiscovered = 0

    let won = false

    let wordDisplay = '🔵'.repeat(word.length)
    if (word.includes('_')) {
      for (let k = 0; k < word.length; k++) {
        if (word.charAt(k) === '_') {
          wordDisplay = setCharAt(wordDisplay, k * 2, '_')
          lettersDiscovered += 1
        }
      }
    }

    let hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
    const embedMessage = await raw.channel.send({
      embed: hangmanEmbed,
    })

    //Listen for inputs
    const filter = (m: discord.Message) =>
      (m.content.length === 1 &&
        m.content.search(/[a-zA-Z0-9]*(_[a-zA-Z0-9]+)*/g) !== -1) ||
      m.content.length === word.length

    const messageCollector = raw.channel.createMessageCollector(filter)

    messageCollector.on('collect', (m: discord.Message) => {
      let addAttempt = true
      let deleteMsg = true

      //If letter hasn't been guessed yet, add it to the guessed list
      if (!guesses.includes(m.content.toUpperCase()) && m.content.length === 1)
        guesses += m.content.toUpperCase()

      //If it's a right guess, refresh the word display
      if (
        m.content.length === 1 &&
        word.toLowerCase().includes(m.content.toLowerCase())
      ) {
        addAttempt = false
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
        addAttempt = false
        won = true
        wordDisplay = word
      } else {
        if (word.length === m.content.length) {
          for (let k = 0; k < word.length; k++) {
            if (
              guesses.includes(word.charAt(k).toUpperCase()) &&
              m.content.charAt(k).toLowerCase() !== word.charAt(k).toLowerCase()
            ) {
              addAttempt = false
              deleteMsg = false
            }
          }
        }
      }

      if (addAttempt) tries += 1

      hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
      void embedMessage.edit({ embed: hangmanEmbed })

      if (tries >= hangmanPics.length - 1) {
        hangmanEmbed = genHangmanEmbed(word, guesses, tries)
        hangmanEmbed
          .setFooter(`Game lost by ${m.author.username}`)
          .setColor('#1D2439')
          .setTimestamp()
        void embedMessage.edit({ embed: hangmanEmbed })
        messageCollector.stop()
        activeChannels.delete(raw.channel.id)
      }

      void (async () => {
        if (deleteMsg) await m.delete()
      })()

      if (won) {
        hangmanEmbed
          .setFooter(`Game won by ${m.author.username}`)
          .setColor('#1D2439')
          .setTimestamp()
        void embedMessage.edit({ embed: hangmanEmbed })
        messageCollector.stop()
        activeChannels.delete(raw.channel.id)
      }
    })
  },
})

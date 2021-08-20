import got from 'got'
import discord from 'discord.js'
import { Command } from '@commands/CommandHandler'
import { env } from '@app/env'

const activeChannels = new Set()

export default new Command<discord.Message>({
  keyword: 'hangman',
  description: 'play a game of hangman',
  help: 'Usage: `{prefix}hangman` - play a game of hangman',
  callback: async ({ args, raw, reply }) => {
    if (args.length > 0) return

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

    const genHangmanEmbed = (
      wordDisplay: string,
      guesses: string,
      tries: number,
    ): discord.MessageEmbed => {
      const wordEmbed = new discord.MessageEmbed()
        .setColor('#647CC4')
        .setTitle(`Hangman game`)
        .addField('Word', wordDisplay)
        .setFooter('Interactive')
        .setTimestamp()

      if (guesses !== '') wordEmbed.addField('Guesses', guesses)
      else wordEmbed.addField('Guesses', 'No guesses yet')

      wordEmbed.addField('Hanging Bru', '`' + hangmanPics[tries] + '`')

      return wordEmbed
    }

    const setCharAt = (str: string, index: number, chr: string) => {
      if (index > str.length - 1) return str
      return str.substring(0, index) + chr + str.substring(index + 1)
    }

    if (env.wordsServiceQuery === null) {
      return reply('The words service is not configured.')
    }

    if (activeChannels.has(raw.channel.id)) {
      return reply('A game of hangman is already running in this channel.')
    }

    const word: string = await got(env.wordsServiceQuery).json()

    activeChannels.add(raw.channel.id)

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
      /^[a-z]+$/i.test(m.content) &&
      (m.content.length === 1 || m.content.length === word.length)

    const messageCollector = raw.channel.createMessageCollector(filter)

    messageCollector.on('collect', (m: discord.Message) => {
      void (async () => {
        let addAttempt = true
        let deleteMsg = true

        //If letter hasn't been guessed yet, add it to the guessed list
        if (
          !guesses.includes(m.content.toUpperCase()) &&
          m.content.length === 1
        )
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
              wordDisplay = setCharAt(
                wordDisplay,
                k * 2,
                m.content.toUpperCase(),
              )
            }
          }
        }

        if (
          lettersDiscovered === word.length ||
          m.content.toLowerCase() === word.toLowerCase()
        ) {
          addAttempt = false
          won = true
          wordDisplay = word
        } else {
          if (word.length === m.content.length) {
            for (let k = 0; k < word.length; k++) {
              if (
                guesses.includes(word.charAt(k).toUpperCase()) &&
                m.content.charAt(k).toLowerCase() !==
                  word.charAt(k).toLowerCase()
              ) {
                addAttempt = false
                deleteMsg = false
              }
            }
          }
        }

        if (addAttempt) tries += 1

        if (deleteMsg) void m.delete()

        if (tries >= hangmanPics.length - 1) {
          messageCollector.stop()
          hangmanEmbed = genHangmanEmbed(word, guesses, tries)
          hangmanEmbed
            .setFooter(`Game lost by ${m.author.username}`)
            .setColor('#1D2439')
            .setTimestamp()
          await embedMessage.edit({ embed: hangmanEmbed })
          activeChannels.delete(raw.channel.id)
        } else {
          hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
          await embedMessage.edit({ embed: hangmanEmbed })
        }

        if (won) {
          messageCollector.stop()
          hangmanEmbed
            .setFooter(`Game won by ${m.author.username}`)
            .setColor('#1D2439')
            .setTimestamp()
          await embedMessage.edit({ embed: hangmanEmbed })
          activeChannels.delete(raw.channel.id)
        }
      })()
    })
  },
})

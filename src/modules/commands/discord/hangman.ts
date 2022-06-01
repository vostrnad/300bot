import discord from 'discord.js'
import got from 'got'
import { env as appEnv } from '@app/env'
import { log } from '@app/utils/log'
import { Command } from '@commands/CommandHandler'
import { DiscordParams } from '@commands/params'

if (appEnv.wordsServiceQuery === null) {
  log.warn('Words service not configured')
}

const activeChannels = new Set()

export default new Command<DiscordParams>({
  keyword: 'hangman',
  description: 'play a game of hangman',
  help: 'Usage: `{prefix}hangman` - play a game of hangman',
  callback: async ({ args, reply, env }) => {
    if (args.length > 0) return

    const channel = env.message.channel

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
      word: string | string[],
      guesses: string[],
      tries: number,
    ): discord.MessageEmbed => {
      const wordString = typeof word === 'string' ? word : word.join('')
      const wordEmbed = new discord.MessageEmbed()
        .setColor('#647CC4')
        .setTitle(`Hangman game`)
        .addField('Word', wordString.toUpperCase())
        .setFooter('Interactive')
        .setTimestamp()

      if (guesses.length > 0) {
        wordEmbed.addField('Guesses', guesses.join('').toUpperCase())
      } else {
        wordEmbed.addField('Guesses', 'No guesses yet')
      }

      wordEmbed.addField('Hanging Bru', '`' + hangmanPics[tries] + '`')

      return wordEmbed
    }

    if (appEnv.wordsServiceQuery === null) {
      return reply('The words service is not configured.')
    }

    if (activeChannels.has(channel.id)) {
      return reply('A game of hangman is already running in this channel.')
    }

    const word: string = await got(appEnv.wordsServiceQuery).json()
    const wordLowercase = word.toLowerCase()

    activeChannels.add(channel.id)

    let tries = 0
    let lettersDiscovered = 0
    const guesses: string[] = []
    const wholeWordGuesses = new Set<string>()

    let won = false

    const wordDisplay = Array<string>(word.length).fill('🔵')

    let hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
    const embedMessage = await channel.send({
      embed: hangmanEmbed,
    })

    // Listen for inputs
    const filter = (m: discord.Message) =>
      /^[a-z]+$/i.test(m.content) &&
      (m.content.length === 1 || m.content.length === word.length)

    const messageCollector = channel.createMessageCollector(filter)

    messageCollector.on('collect', (m: discord.Message) => {
      void (async () => {
        if (won || tries >= hangmanPics.length - 1) {
          return
        }

        let deleteMessage = false
        let updateEmbed = false

        const guess = m.content.toLowerCase()

        // Check single letter guess
        if (
          guess.length === 1 &&
          (/[a-z]/.test(guess) || wordLowercase.includes(guess))
        ) {
          deleteMessage = true

          if (!guesses.includes(guess)) {
            guesses.push(guess)
            updateEmbed = true

            if (wordLowercase.includes(guess)) {
              for (let i = 0; i < word.length; i++) {
                if (wordLowercase.charAt(i) === guess) {
                  lettersDiscovered += 1
                  wordDisplay[i] = guess
                }
              }
              if (lettersDiscovered >= word.length) {
                won = true
              }
            } else {
              tries += 1
            }
          }
        }

        // Check whole word guesses
        if (guess.length === word.length && !wholeWordGuesses.has(guess)) {
          // Check if the word fits the currently available letters
          for (let i = 0; i < word.length; i++) {
            const guessChar = guess.charAt(i)
            const wordChar = wordLowercase.charAt(i)
            if (
              guessChar !== wordChar &&
              (guesses.includes(guessChar) || guesses.includes(wordChar))
            ) {
              return
            }
          }

          wholeWordGuesses.add(guess)
          updateEmbed = true

          if (wordLowercase === guess) {
            won = true
            await m.react('🎉')
          } else {
            tries += 1
            await m.react('❌')
          }
        }

        const authorName = m.member?.displayName || m.author.username

        if (tries >= hangmanPics.length - 1) {
          messageCollector.stop()
          hangmanEmbed = genHangmanEmbed(word, guesses, tries)
          hangmanEmbed
            .setFooter(`Game lost by ${authorName}`)
            .setColor('#1D2439')
            .setTimestamp()
          await embedMessage.edit({ embed: hangmanEmbed })
          activeChannels.delete(channel.id)
        } else if (won) {
          messageCollector.stop()
          hangmanEmbed = genHangmanEmbed(word, guesses, tries)
          hangmanEmbed
            .setFooter(`Game won by ${authorName}`)
            .setColor('#1D2439')
            .setTimestamp()
          await embedMessage.edit({ embed: hangmanEmbed })
          activeChannels.delete(channel.id)
        } else if (updateEmbed) {
          hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
          await embedMessage.edit({ embed: hangmanEmbed })
        }

        if (deleteMessage) await m.delete()
      })()
    })
  },
})

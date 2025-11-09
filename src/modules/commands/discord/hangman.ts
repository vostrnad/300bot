import * as discord from 'discord.js'
import got from 'got'
import { env as appEnv } from '@app/env'
import { log } from '@app/utils/log'
import { Command } from '@commands/command-handler'
import { DiscordParams } from '@commands/params'
import { validateArgumentRange } from '@commands/validators'
import { addReaction } from '@discord/utils'

if (appEnv.wordsServiceQuery === null) {
  log.warn('Words service not configured')
}

const activeChannels = new Set()

export default new Command<DiscordParams>({
  keyword: 'hangman',
  description: 'play a game of hangman',
  help: 'Usage:\n`{prefix}hangman` - play a game of hangman\n`{prefix}hangman custom` - play hangman with a custom word',
  callback: async ({ args, reply, env }) => {
    validateArgumentRange(args.length, 0, 1)

    const channel = env.message.channel

    if (activeChannels.has(channel.id)) {
      return reply('A game of hangman is already running in this channel.')
    }

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
        .addFields({ name: 'Word', value: wordString.toUpperCase() })
        .setFooter({ text: 'Interactive' })
        .setTimestamp()

      if (guesses.length > 0) {
        wordEmbed.addFields({
          name: 'Guesses',
          value: guesses.join('').toUpperCase(),
        })
      } else {
        wordEmbed.addFields({ name: 'Guesses', value: 'No guesses yet' })
      }

      wordEmbed.addFields({
        name: 'Hanging Bru',
        value: `\`${hangmanPics[tries]}\``,
      })

      return wordEmbed
    }

    let word: string

    if (args[0] === 'custom') {
      const dmChannel = await env.message.author.createDM()

      const getWordFromDm = async (): Promise<string> => {
        await dmChannel.send('What word do you choose?')

        let dmWord: string | undefined

        while (!dmWord) {
          const dmReplyMessage = // eslint-disable-next-line no-await-in-loop
            (await dmChannel.awaitMessages({ max: 1 })).first()
          const dmReply = dmReplyMessage?.content

          if (!dmReply) {
            // eslint-disable-next-line no-await-in-loop
            await dmChannel.send('Something went wrong. Please try again.')
            continue
          }

          if (dmReply.includes(' ')) {
            // eslint-disable-next-line no-await-in-loop
            await dmChannel.send(
              'The word cannot contain any spaces. Please try again.',
            )
            continue
          }

          if (!/^[a-z]+$/i.test(dmReply)) {
            // eslint-disable-next-line no-await-in-loop
            await dmChannel.send(
              'The word contains invalid characters. Please try again.',
            )
            continue
          }

          dmWord = dmReply
        }

        return dmWord
      }

      word = await getWordFromDm()

      if (activeChannels.has(channel.id)) {
        await dmChannel.send(
          'A game of hangman is already running in the channel. Please try again later.',
        )
        return
      }

      await dmChannel.send('Your word has been registered.')
    } else {
      if (appEnv.wordsServiceQuery === null) {
        return reply('The words service is not configured.')
      }

      word = await got(appEnv.wordsServiceQuery).json()
    }

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
      embeds: [hangmanEmbed],
    })

    // Listen for inputs
    const filter = (m: discord.Message) =>
      /^[a-z]+$/i.test(m.content) &&
      (m.content.length === 1 || m.content.length === word.length)

    const messageCollector = channel.createMessageCollector({ filter })

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
            await addReaction(m, '🎉')
          } else {
            tries += 1
            await addReaction(m, '❌')
          }
        }

        const authorName = m.member?.displayName || m.author.username

        if (tries >= hangmanPics.length - 1) {
          messageCollector.stop()
          hangmanEmbed = genHangmanEmbed(word, guesses, tries)
          hangmanEmbed
            .setFooter({ text: `Game lost by ${authorName}` })
            .setColor('#1D2439')
            .setTimestamp()
          await embedMessage.edit({ embeds: [hangmanEmbed] })
          activeChannels.delete(channel.id)
        } else if (won) {
          messageCollector.stop()
          hangmanEmbed = genHangmanEmbed(word, guesses, tries)
          hangmanEmbed
            .setFooter({ text: `Game won by ${authorName}` })
            .setColor('#1D2439')
            .setTimestamp()
          await embedMessage.edit({ embeds: [hangmanEmbed] })
          activeChannels.delete(channel.id)
        } else if (updateEmbed) {
          hangmanEmbed = genHangmanEmbed(wordDisplay, guesses, tries)
          await embedMessage.edit({ embeds: [hangmanEmbed] })
        }

        if (deleteMessage && m.channel instanceof discord.TextChannel) {
          try {
            await m.delete()
          } catch (e) {
            log.error('Error deleting message:', e)
          }
        }
      })()
    })
  },
})

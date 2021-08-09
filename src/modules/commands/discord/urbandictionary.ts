import { Command } from '@commands/CommandHandler'
import got from 'got'
import { isRecord } from '@app/validators/object'
import camelcaseKeys from 'camelcase-keys'
import discord from 'discord.js'

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
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) return reply(env.command.getHelp(env.handler))

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

    const re = /\[(\w+(\s\w+)*?)\]/g

    const wordString = word.includes(' ') ? 'Expression' : 'Word'

    if (list.length === 0)
      return reply(
        `${wordString} **${word}** does not exist in urban dictionary.`,
      )

    list = list.sort((a: Definition, b: Definition) => {
      if (b.thumbsUp > a.thumbsUp) return 1
      else return -1
    })

    let message = `**${wordString}:** ${list[0].word}\n\n`
    message += `**Definition:** ${list[0].definition.replace(re, '*$1*')}\n\n`

    if (list[0].example !== '')
      message += `**Example:** ${list[0].example.replace(re, '*$1*')}.\n`

    return reply(message)
  },
})

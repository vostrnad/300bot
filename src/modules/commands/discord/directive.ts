import discord from 'discord.js'
import {
  PlayerNotFoundError,
  DirectiveTreeCategoryNotFoundError,
} from '@app/errors'
import { Command } from '@commands/CommandHandler'
import { censusApi } from '@planetside/CensusApi'
import { validateArgumentNumber } from '../validators'

export default new Command<discord.Message>({
  keyword: 'directive',
  description: 'show PS2 player directive',
  help: "Usage:`{prefix}directive <player name> <directive category>` - shows player's Planetside 2 directives",
  options: {
    lastArgNumber: 2,
  },
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 2)

    const character = await censusApi.getCharacter({
      name: { firstLower: args[0] },
    })

    if (character === null) throw new PlayerNotFoundError()

    let category: string

    if (args[1] === 'full') {
      category = ''
    } else {
      category = args[1]
    }

    category = category
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(' ')

    let playerDirective = await censusApi.getPlayerDirective(
      character.characterId,
      category,
    )

    if (playerDirective === null) throw new DirectiveTreeCategoryNotFoundError()

    playerDirective = playerDirective.filter((cat) => {
      return typeof cat.directiveTree !== 'undefined'
    })

    playerDirective.forEach((cat) => {
      cat.directiveTree = cat.directiveTree.filter((tree) => {
        return typeof tree.directiveTier !== 'undefined'
      })
    })

    playerDirective.forEach((cat) => {
      cat.directiveTree.forEach((tree) => {
        tree.directiveTier = tree.directiveTier.filter((tier) => {
          return tier.completionTime !== '0'
        })
      })
    })

    const emojis = ['⚫', '🟤', '⚪', '🟡', '🟣']

    let message = ''
    playerDirective.forEach((cat) => {
      if (cat.directiveTree.length > 0) {
        message += `**${cat.name.en}** directive for **${character.name.first}**\n`

        cat.directiveTree.forEach((tree, idx, array) => {
          message += `*${tree.name.en}* ${emojis[tree.directiveTier.length]} ${
            idx !== array.length - 1 ? '|' : ''
          } `
        })

        message += '\n'
      }
    })

    return reply(message)
  },
})

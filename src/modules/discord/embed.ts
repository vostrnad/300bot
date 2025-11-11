import discord from 'discord.js'
import { constants } from '@app/global/constants'
import { mod } from '@app/utils/math'
import { removeReaction } from '@discord/utils'

export const sendScrollEmbed = async <T>(
  message: discord.Message,
  list: T[],
  factory: (item: T, index: number, active: boolean) => discord.MessageEmbed,
): Promise<void> => {
  const timeout = 10 * 60 * 1000 // 10 minutes

  // no need to handle interactions when there's only one item
  if (list.length === 1) {
    await message.channel.send({
      embeds: [factory(list[0], 0, false)],
    })
    return
  }

  let currentIndex = 0

  const embedMessage = await message.channel.send({
    embeds: [factory(list[currentIndex], currentIndex, true)],
  })

  const leftArrowReaction = await embedMessage.react(
    constants.discord.emojis.arrowLeft,
  )
  const rightArrowReaction = await embedMessage.react(
    constants.discord.emojis.arrowRight,
  )

  const collector = embedMessage.createReactionCollector({
    time: timeout,
    filter: (reaction, user) =>
      [
        constants.discord.emojis.arrowLeft,
        constants.discord.emojis.arrowRight,
      ].includes(reaction.emoji.name as string) &&
      user.id === message.author.id,
  })

  collector.on('collect', (reaction: discord.MessageReaction) => {
    if (reaction.emoji.name === constants.discord.emojis.arrowRight) {
      currentIndex = mod(currentIndex + 1, list.length)
    }

    if (reaction.emoji.name === constants.discord.emojis.arrowLeft) {
      currentIndex = mod(currentIndex - 1, list.length)
    }

    void (async () => {
      await embedMessage.edit({
        embeds: [factory(list[currentIndex], currentIndex, true)],
      })
      if (message.channel instanceof discord.TextChannel) {
        await removeReaction(reaction, message.author)
      }
    })()
  })

  collector.on('end', () => {
    void (async () => {
      await embedMessage.edit({
        embeds: [factory(list[currentIndex], currentIndex, false)],
      })
      await rightArrowReaction.remove()
      await leftArrowReaction.remove()
    })()
  })
}

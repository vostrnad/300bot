import discord from 'discord.js'
import { schedule } from '@app/utils/async'
import { log } from '@app/utils/log'
import { reviveDatabase } from '@database/revive'

export const getTextChannel = (
  client: discord.Client,
  id: string,
): discord.TextChannel | null => {
  const channel = client.channels.resolve(id)
  if (channel instanceof discord.TextChannel) {
    return channel
  }
  return null
}

export const getDMChannel = async (
  client: discord.Client,
  id: string,
): Promise<discord.DMChannel | null> => {
  const channel = await client.channels.fetch(id)
  if (channel instanceof discord.DMChannel) {
    return channel
  }
  return null
}

export const formatWithEmojis = (
  channel: discord.Channel,
  message: string,
): string => {
  // eslint-disable-next-line unicorn/no-unsafe-regex
  const emojiExpressionRegex = /{emoji:([^|]*)(?:\|([^}]*))?}/g

  if (channel instanceof discord.TextChannel) {
    return message.replace(
      emojiExpressionRegex,
      (_match, emojiName, fallbackText) => {
        const emoji = channel.guild.emojis.cache.find(
          ({ name }) => name === emojiName,
        )
        if (emoji) {
          return emoji.toString()
        } else if (typeof fallbackText === 'string') {
          return fallbackText
        } else {
          return ''
        }
      },
    )
  } else {
    return message.replace(
      emojiExpressionRegex,
      (_match, _emojiName, fallbackText) => {
        if (typeof fallbackText === 'string') {
          return fallbackText
        } else {
          return ''
        }
      },
    )
  }
}

export const removeReaction = async (
  reaction: discord.MessageReaction,
  user: discord.User,
): Promise<void> => {
  try {
    await reaction.users.remove(user)
  } catch (error) {
    log.error('Error removing reaction:', error)
  }
}

export const reviveMember = async (
  member: discord.GuildMember,
  deadRole: discord.Role,
): Promise<void> => {
  const guildId = member.guild.id
  const userId = member.id

  await member.roles.remove(deadRole)
  await reviveDatabase.delete(`${guildId}.${userId}`)
}

export const killMember = async (
  member: discord.GuildMember,
  deadRole: discord.Role,
  reviveDelayMs: number,
): Promise<void> => {
  const userId = member.id
  const guildId = member.guild.id

  const reviveTime = Date.now() + reviveDelayMs

  await reviveDatabase.set(`${guildId}.${userId}`, reviveTime)
  await member.roles.add(deadRole)

  void schedule(async () => {
    try {
      await reviveMember(member, deadRole)
    } catch (e) {
      log.error('Cannot revive member:', e)
    }
  }, reviveDelayMs)
}

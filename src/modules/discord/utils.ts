import discord from 'discord.js'

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

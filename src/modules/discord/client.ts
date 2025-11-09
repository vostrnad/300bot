import discord from 'discord.js'

export const client = new discord.Client({
  intents: [
    discord.Intents.FLAGS.GUILDS,
    discord.Intents.FLAGS.GUILD_MEMBERS,
    discord.Intents.FLAGS.GUILD_MESSAGES,
    discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    discord.Intents.FLAGS.GUILD_BANS,
    discord.Intents.FLAGS.GUILD_VOICE_STATES,
    discord.Intents.FLAGS.MESSAGE_CONTENT,
    discord.Intents.FLAGS.DIRECT_MESSAGES,
    discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
})

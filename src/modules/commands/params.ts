import discord from 'discord.js'

export type Settings = {
  prefix: string
  outfitId?: string
}

export type SettingsParams = {
  settings: Settings
  updateSettings: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => void | Promise<void>
}

export type DiscordParams = SettingsParams & {
  message: discord.Message
}

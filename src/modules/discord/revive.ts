import discord from 'discord.js'
import { schedule } from '@app/utils/async'
import { log } from '@app/utils/log'
import { reviveDatabase } from '@database/revive'
import { client } from '@discord/client'

export const scheduleRevivesOnStartup = (): void => {
  client.on('ready', () => {
    const now = Date.now()

    void (async () => {
      for (const [guildId, users] of Object.entries(reviveDatabase.root)) {
        const guild = client.guilds.resolve(guildId)
        if (!guild) continue

        const deadRole = guild.roles.cache.find((role) => role.name === 'Dead')
        if (!deadRole) continue

        for (const [userId, reviveTimestamp] of Object.entries(users)) {
          const reviveUser = async () => {
            try {
              const member = await guild.members.fetch(userId)
              await reviveMember(member, deadRole)
            } catch (e) {
              log.error('Cannot revive member:', e)
            }
          }

          if (now >= reviveTimestamp) {
            log.debug(`Reviving member ${guildId}:${userId}`)
            await reviveUser()
          } else {
            const delay = reviveTimestamp - now
            const delayText = `${Math.round(delay / 1000)}s`
            log.debug(`Reviving member ${guildId}:${userId} in ${delayText}`)
            void schedule(reviveUser, delay)
          }
        }
      }
    })()
  })
}

export const checkNewMemberDeadRole = (): void => {
  client.on('guildMemberAdd', (member) => {
    const guildId = member.guild.id
    const userId = member.id
    const dbPath = `${guildId}.${userId}` as const

    const reviveTime = reviveDatabase.get(dbPath)

    if (reviveTime) {
      if (Date.now() < reviveTime) {
        const deadRole = member.guild.roles.cache.find(
          (role) => role.name === 'Dead',
        )
        if (!deadRole) return

        void member.roles.add(deadRole)
      } else {
        void reviveDatabase.delete(dbPath)
      }
    }
  })
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

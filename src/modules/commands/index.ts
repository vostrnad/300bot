import { commonCommands } from './common'
import { discordCommands } from './discord'
import { staticCommands } from './static'

export const commands = [
  ...commonCommands,
  ...discordCommands,
  ...staticCommands,
]

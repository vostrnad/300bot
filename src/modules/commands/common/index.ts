import { Command } from '@commands/CommandHandler'
import coinflip from './coinflip'
import diceroll from './diceroll'
import help from './help'
import isbruonline from './isbruonline'
import whoisonline from './whoisonline'
import hello from './hello'
import membercount from './membercount'

export const commonCommands: Command[] = [
  coinflip,
  diceroll,
  help,
  isbruonline,
  whoisonline,
  hello,
  membercount,
]

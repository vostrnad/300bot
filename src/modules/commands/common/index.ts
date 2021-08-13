import { Command } from '@commands/CommandHandler'
import coinflip from './coinflip'
import diceroll from './diceroll'
import help from './help'
import isbruonline from './isbruonline'
import whoisonline from './whoisonline'
import hello from './hello'
import membercount from './membercount'
import recentstats from './recentstats'
import whoisleading from './whoisleading'
import math from './math'
import brudistance from './brudistance'

export const commonCommands: Command[] = [
  coinflip,
  diceroll,
  help,
  isbruonline,
  whoisonline,
  hello,
  membercount,
  recentstats,
  whoisleading,
  math,
  brudistance,
]

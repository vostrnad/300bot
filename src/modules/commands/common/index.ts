import { Command } from '@commands/CommandHandler'
import brudistance from './brudistance'
import coinflip from './coinflip'
import diceroll from './diceroll'
import hello from './hello'
import help from './help'
import isbruonline from './isbruonline'
import math from './math'
import membercount from './membercount'
import playersearch from './playersearch'
import recentstats from './recentstats'
import uptime from './uptime'
import whoisleading from './whoisleading'
import whoisonline from './whoisonline'

export const commonCommands: Command[] = [
  brudistance,
  coinflip,
  diceroll,
  hello,
  help,
  isbruonline,
  math,
  membercount,
  playersearch,
  recentstats,
  uptime,
  whoisleading,
  whoisonline,
]

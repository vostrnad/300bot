import { Command } from '@commands/CommandHandler'
import brudistance from './brudistance'
import certs from './certs'
import coinflip from './coinflip'
import diceroll from './diceroll'
import directive from './directive'
import hello from './hello'
import help from './help'
import isbruonline from './isbruonline'
import math from './math'
import membercount from './membercount'
import outfitstats from './outfitstats'
import playersearch from './playersearch'
import playerstats from './playerstats'
import population from './population'
import recentstats from './recentstats'
import restartsocket from './restartsocket'
import uptime from './uptime'
import whoisleading from './whoisleading'
import whoisonline from './whoisonline'

export const commonCommands: Command[] = [
  brudistance,
  certs,
  coinflip,
  diceroll,
  directive,
  hello,
  help,
  isbruonline,
  math,
  membercount,
  outfitstats,
  playersearch,
  playerstats,
  population,
  recentstats,
  restartsocket,
  uptime,
  whoisleading,
  whoisonline,
]

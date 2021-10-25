import { Command } from '@app/modules/commands/CommandHandler'
import { client } from '@app/modules/discord/client'
import { commands } from '@commands/index'
import { getMultipleCommandRunner } from '@test/utils/commands'

afterAll(() => {
  client.destroy()
})

describe('help', () => {
  const comm = commands as Command[]
  const runcommand = getMultipleCommandRunner(comm)

  it('should display the help message', async () => {
    const reply = await runcommand('+help')
    expect(reply).toEqual(
      `This is a list of all my basic commands:

**+certs** - show player's available certs
**+hello** - say hello
**+help** - show command help
**+isbruonline** - check if Bru is online
**+membercount** - count outfit members
**+playerstats** - show PS2 player stats
**+population** - display the current population
**+whoisleading** - check who is leading
**+whoisonline** - check who is online\n\n`,
    )
  })

  it('should say that there is no existing category/command', async () => {
    const reply = await runcommand('+help TH1SC0MMANDD03SNT3X1ST')
    expect(reply).toEqual('There is no catergory or command with this name.')
  })

  it('should display the full help', async () => {
    const reply = await runcommand('+help full')
    expect(reply).toEqual(
      `This is a list of all my commands:

__**Basic**__
**+certs** - show player's available certs
**+hello** - say hello
**+help** - show command help
**+isbruonline** - check if Bru is online
**+membercount** - count outfit members
**+playerstats** - show PS2 player stats
**+population** - display the current population
**+whoisleading** - check who is leading
**+whoisonline** - check who is online

__**Advanced**__
**+alts** - show player's alts
**+brudistance** - find player's interaction chain with Bru
**+directive** - show PS2 player directive
**+outfitscoreboard** - show PS2 outfit player scoreboard
**+outfitstats** - show PS2 outfit stats
**+playersearch** - find PlanetSide 2 players
**+recentstats** - show recent player stats
**+weaponstats** - show PS2 player weapon stats
**+whotokick** - show players that can be kicked from the outfit

__**Fun**__
**+coinflip** - flip a coin
**+diceroll** - roll a dice
**+hangman** - play a game of hangman
**+math** - evaluate a math expression
**+russianroulette** - kill yourself for fun purposes
**+urbandictionary** - get the modern definition of a word or expression

__**Admin**__
**+alerttracker** - configure the alert tracker
**+brucharacters** - manage Bru's characters
**+cooldown** - close a channel temporarily
**+prefix** - set command prefix
**+track** - track PlanetSide 2 characters
**+uptime** - display time since last reboot\n\n`,
    )
  })
})

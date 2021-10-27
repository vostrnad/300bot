import { Command } from '@commands/CommandHandler'
import { commands } from '@commands/index'
import { getMultipleCommandRunner } from '@test/utils/commands'

describe('help', () => {
  const comm = commands as Command[]
  const runcommand = getMultipleCommandRunner(comm)

  it('should display the help message', async () => {
    const reply = await runcommand('+help')
    expect(reply).toMatchSnapshot()
  })

  it('should say that there is no existing category/command', async () => {
    const reply = await runcommand('+help TH1SC0MMANDD03SNT3X1ST')
    expect(reply).toEqual('There is no catergory or command with this name.')
  })

  it('should display the full help', async () => {
    const reply = await runcommand('+help full')
    expect(reply).toMatchSnapshot()
  })
})

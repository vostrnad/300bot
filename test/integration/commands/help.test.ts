import help from '@app/modules/commands/common/help'
import { getCommandRunner } from '@test/utils/commands'

describe('help', () => {
  const runcommand = getCommandRunner(help)

  it('should display the help message', async () => {
    const reply = await runcommand('+help')
    expect(reply).toEqual(
      'This is a list of all my basic commands:\n\n**+help** - show command help\n\n',
    )
  })

  it('should say that there is no existing category/command', async () => {
    const reply = await runcommand('+help Advanced')
    expect(reply).toEqual('There is no catergory or command with this name.')
  })

  it('should display the full help', async () => {
    const reply = await runcommand('+help full')
    expect(reply).toEqual(
      'This is a list of all my commands:\n\n__**Basic**__\n**+help** - show command help\n\n',
    )
  })
})

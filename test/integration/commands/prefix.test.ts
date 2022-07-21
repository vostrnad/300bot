import prefix from '@commands/common/prefix'
import { getCommandRunner } from '@test/utils/commands'

describe('prefix', () => {
  const runCommand = getCommandRunner(prefix)

  it('should change the prefix', async () => {
    const reply1 = await runCommand('+prefix !')
    expect(reply1).toEqual('Command prefix updated.')

    const reply2 = await runCommand('+prefix +')
    expect(reply2).toBeNull()

    const reply3 = await runCommand('!prefix +')
    expect(reply3).toEqual('Command prefix updated.')
  })
})

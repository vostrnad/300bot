import math from '@commands/common/math'
import { getCommandRunner } from '@test/utils/commands'

describe('math', () => {
  const runCommand = getCommandRunner(math)

  it('should evaluate a simple expression', async () => {
    const reply = await runCommand('+math 1 + 2')
    expect(reply).toEqual('= 3')
  })

  it('should evaluate a complex expression', async () => {
    const reply = await runCommand('+math e^(i*pi)')
    expect(reply).toEqual('= -1')
  })
})

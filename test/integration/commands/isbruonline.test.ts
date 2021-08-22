import isbruonline from '@commands/common/isbruonline'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

describe('isbruonline', () => {
  const runCommand = getCommandRunner(isbruonline)

  it('should say Bru is online', async () => {
    const requestData = mockCensusApi({
      characters_online_status_list: [{ online_status: '10' }],
    })
    const reply = await runCommand('+isbruonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('Yes, Bru is online!')
  })

  it('should say Bru is offline', async () => {
    const requestData = mockCensusApi({
      characters_online_status_list: [{ online_status: '0' }],
    })
    const reply = await runCommand('+isbruonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('No, Bru is offline.')
  })
})

import membercount from '@commands/common/membercount'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

describe('membercount', () => {
  const runCommand = getCommandRunner(membercount)

  it('should work for the default outfit', async () => {
    const outfit = {
      outfitId: 'id',
      name: 'Test Outfit',
      memberCount: '42',
    }
    const requestData = mockCensusApi({ outfit_list: [outfit] })
    const reply = await runCommand('+membercount')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('The outfit **Test Outfit** has 42 members.')
  })

  it('should work for a custom outfit', async () => {
    const outfit = {
      outfitId: 'id',
      name: 'Custom Outfit',
      memberCount: '123',
    }
    const requestData = mockCensusApi({ outfit_list: [outfit] })
    const reply = await runCommand('+membercount cstm')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('The outfit **Custom Outfit** has 123 members.')
  })

  it('should reply with an error when the outfit does not exist', async () => {
    const requestData = mockCensusApi({ outfit_list: [] })
    const reply = await runCommand('+membercount nope')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('No outfit corresponds to this request.')
  })
})

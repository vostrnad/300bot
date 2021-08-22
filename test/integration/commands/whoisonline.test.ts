import whoisonline from '@commands/common/whoisonline'
import { getCommandRunner } from '@test/utils/commands'
import { generate } from '@test/utils/data'
import { mockCensusApi } from '@test/utils/planetside'

describe('whoisonline', () => {
  const runCommand = getCommandRunner(whoisonline)

  it('should work when API response is empty', async () => {
    const requestData = mockCensusApi({ outfit_member_list: [] })
    const reply = await runCommand('+whoisonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('No outfit members are online.')
  })

  it('should work when everyone is offline', async () => {
    const list = generate(3, (index) => ({
      character_id: `id${index}`,
      character: {
        name: { first: `TestMember${index}` },
        online_status: '0',
      },
    }))
    const requestData = mockCensusApi({ outfit_member_list: list })
    const reply = await runCommand('+whoisonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('No outfit members are online.')
  })

  it('should work when one member is online', async () => {
    const list = generate(3, (index) => ({
      character_id: `id${index}`,
      character: {
        name: { first: `TestMember${index}` },
        online_status: index === 1 ? '1' : '0',
      },
    }))
    const requestData = mockCensusApi({ outfit_member_list: list })
    const reply = await runCommand('+whoisonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('**TestMember1** is the only online outfit member.')
  })

  it('should work when some members are online', async () => {
    const list = generate(6, (index) => ({
      character_id: `id${index}`,
      character: {
        name: { first: `TestMember${index}` },
        online_status: index % 2 === 0 ? '0' : '1',
      },
    }))
    const requestData = mockCensusApi({ outfit_member_list: list })
    const reply = await runCommand('+whoisonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      'These 3 outfit members are online: **TestMember1**, **TestMember3** and **TestMember5**.',
    )
  })
})

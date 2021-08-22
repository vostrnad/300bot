import playersearch from '@commands/common/playersearch'
import { getCommandRunner } from '@test/utils/commands'
import { generate } from '@test/utils/data'
import { mockCensusApi } from '@test/utils/planetside'

describe('playersearch', () => {
  const runCommand = getCommandRunner(playersearch)

  it('should work with one keyword', async () => {
    const list = generate(3, (index) => ({
      name: { first: `Test${index + 1}` },
    }))
    const requestData = mockCensusApi({ character_name_list: list })
    const reply = await runCommand('+playersearch test')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      'Characters found: **Test1**, **Test2** and **Test3**.',
    )
  })

  it('should work with multiple keywords', async () => {
    const list = generate(3, (index) => ({
      name: { first: `Foo${index + 1}Bar` },
    }))
    const requestData = mockCensusApi({ character_name_list: list })
    const reply = await runCommand('+playersearch foo bar')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      'Characters found: **Foo1Bar**, **Foo2Bar** and **Foo3Bar**.',
    )
  })
})

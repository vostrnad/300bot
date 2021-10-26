import brucharacters from '@app/modules/commands/common/brucharacters'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

describe('brucharacters', () => {
  const runCommand = getCommandRunner(brucharacters)

  it('should display the list of characters in the database', async () => {
    mockCensusApi({
      character_name_list: [
        {
          characterId: 'testlist',
          name: { first: 'CustomCharList', firstLower: 'customcharlist' },
        },
      ],
    })

    const reply = await runCommand('+brucharacters add customcharlist')

    expect(reply).toEqual(
      "**CustomCharList** has been added to the list of Bru's characters.",
    )

    const requestData1 = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testlist',
          name: { first: 'CustomCharList', firstLower: 'customcharlist' },
        },
      ],
    })

    const reply1 = await runCommand('+brucharacters list')
    expect(requestData1).toMatchSnapshot()
    expect(reply1).toEqual(
      'Here is the list of all known Bru characters: **CustomCharList**.',
    )

    mockCensusApi({
      character_name_list: [
        {
          characterId: 'testlist',
          name: { first: 'CustomCharList', firstLower: 'customcharlist' },
        },
      ],
    })
    await runCommand('+brucharacters remove CustomCharList')
  })
})

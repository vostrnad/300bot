import brucharacters from '@app/modules/commands/common/brucharacters'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

describe('brucharacters', () => {
  const runCommand = getCommandRunner(brucharacters)

  it('should say that the character is already in the list', async () => {
    const requestDataAdd = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testduplicate',
          name: { first: 'CustomCharDup', firstLower: 'customchardup' },
        },
      ],
    })
    const replyAdd = await runCommand('+brucharacters add CustomCharDup')
    expect(requestDataAdd).toMatchSnapshot()
    expect(replyAdd).toEqual(
      "**CustomCharDup** has been added to the list of Bru's characters.",
    )

    const requestDataDup = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testduplicate',
          name: { first: 'CustomCharDup', firstLower: 'customchardup' },
        },
      ],
    })

    const replyDup = await runCommand('+brucharacters add CustomCharDup')
    expect(requestDataDup).toMatchSnapshot()
    expect(replyDup).toEqual(
      "**CustomCharDup** is already in the list of Bru's characters.",
    )

    mockCensusApi({
      character_name_list: [
        {
          characterId: 'testduplicate',
          name: { first: 'CustomCharDup', firstLower: 'customchardup' },
        },
      ],
    })
    await runCommand('+brucharacters remove CustomCharDup')
  })
})
